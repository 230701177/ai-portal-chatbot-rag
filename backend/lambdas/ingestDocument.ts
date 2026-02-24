import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';
import { bedrockClient, s3Client, opensearchClient, config } from '../config/aws';
import { PDFService } from '../services/pdfService';
import { ChunkService } from '../services/chunkService';
import { EmbeddingService } from '../services/embeddingService';
import { VectorService } from '../services/vectorService';

const logger = new Logger('IngestDocument');

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info('Ingestion started');

    // Parse request
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const body = JSON.parse(event.body);
    const { fileName, fileContent } = body;

    if (!fileName || !fileContent) {
      return errorResponse('fileName and fileContent are required', 400);
    }

    // Validate PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return errorResponse('Only PDF files are supported', 400);
    }

    // Decode base64 file content
    const fileBuffer = Buffer.from(fileContent, 'base64');
    const documentId = uuidv4();

    // Initialize services
    const pdfService = new PDFService(s3Client, config.s3Bucket);
    const chunkService = new ChunkService(config.chunkSize, config.chunkOverlap);
    const embeddingService = new EmbeddingService(bedrockClient, config.embeddingModelId);
    const vectorService = new VectorService(opensearchClient, config.opensearchIndex);

    // Ensure OpenSearch index exists
    await vectorService.ensureIndex();

    // Step 1: Upload PDF to S3
    logger.info('Uploading PDF to S3');
    await pdfService.uploadPDF(fileBuffer, fileName, documentId);

    // Step 2: Extract text
    logger.info('Extracting text from PDF');
    const rawText = await pdfService.extractText(fileBuffer);
    const cleanedText = pdfService.cleanText(rawText);

    if (cleanedText.length < 100) {
      return errorResponse('PDF contains insufficient text content', 400);
    }

    // Step 3: Chunk text
    logger.info('Chunking text');
    const chunks = chunkService.chunkText(cleanedText);

    if (chunks.length === 0) {
      return errorResponse('Failed to create chunks from text', 500);
    }

    // Step 4: Generate embeddings
    logger.info('Generating embeddings', { chunkCount: chunks.length });
    const embeddings = await embeddingService.generateBatchEmbeddings(
      chunks.map(c => c.text)
    );

    // Step 5: Index in OpenSearch
    logger.info('Indexing documents in OpenSearch');
    const vectorDocuments = chunks.map((chunk, idx) => ({
      id: `${documentId}-${chunk.chunkNumber}`,
      text: chunk.text,
      embedding: embeddings[idx],
      document_name: fileName,
      chunk_number: chunk.chunkNumber,
      created_at: new Date().toISOString()
    }));

    await vectorService.indexDocuments(vectorDocuments);

    logger.info('Ingestion completed successfully', {
      documentId,
      fileName,
      totalChunks: chunks.length
    });

    return successResponse({
      status: 'Indexed',
      documentId,
      fileName,
      total_chunks: chunks.length,
      message: 'Document indexed successfully'
    });

  } catch (error: any) {
    logger.error('Ingestion failed', error);
    return errorResponse(
      'Document ingestion failed',
      500,
      { message: error.message }
    );
  }
};
