import { APIGatewayProxyHandler } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';
import { bedrockClient, opensearchClient, config } from '../config/aws';
import { EmbeddingService } from '../services/embeddingService';
import { VectorService } from '../services/vectorService';
import { LLMService } from '../services/llmService';

const logger = new Logger('QueryChat');

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info('Query started');

    // Parse request
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const body = JSON.parse(event.body);
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return errorResponse('question is required and must be a string', 400);
    }

    if (question.trim().length === 0) {
      return errorResponse('question cannot be empty', 400);
    }

    if (question.length > 500) {
      return errorResponse('question exceeds maximum length of 500 characters', 400);
    }

    // Initialize services
    const embeddingService = new EmbeddingService(bedrockClient, config.embeddingModelId);
    const vectorService = new VectorService(opensearchClient, config.opensearchIndex);
    const llmService = new LLMService(bedrockClient, config.llmModelId);

    // Step 1: Generate query embedding
    logger.info('Generating query embedding');
    const queryEmbedding = await embeddingService.generateEmbedding(question);

    // Step 2: Retrieve relevant chunks
    logger.info('Searching for relevant chunks');
    const searchResults = await vectorService.search(queryEmbedding, config.topK);

    if (searchResults.length === 0) {
      return successResponse({
        answer: 'Information not found in uploaded documents.',
        sources: [],
        confidence: 0,
        message: 'No relevant documents found'
      });
    }

    // Filter by similarity threshold
    const filteredResults = searchResults.filter(
      result => result.score >= config.similarityThreshold
    );

    if (filteredResults.length === 0) {
      return successResponse({
        answer: 'Information not found in uploaded documents.',
        sources: [],
        confidence: 0,
        message: 'No documents met the similarity threshold'
      });
    }

    // Step 3: Generate answer using LLM
    logger.info('Generating answer', { contextChunks: filteredResults.length });
    const response = await llmService.generateAnswer(question, filteredResults);

    logger.info('Query completed successfully', {
      confidence: response.confidence,
      sourcesCount: response.sources.length
    });

    return successResponse({
      answer: response.answer,
      sources: response.sources,
      confidence: response.confidence,
      retrieved_chunks: filteredResults.length
    });

  } catch (error: any) {
    logger.error('Query failed', error);
    return errorResponse(
      'Query processing failed',
      500,
      { message: error.message }
    );
  }
};
