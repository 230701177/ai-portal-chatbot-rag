import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Logger } from '../utils/logger';

const logger = new Logger('EmbeddingService');

export class EmbeddingService {
  constructor(
    private bedrockClient: BedrockRuntimeClient,
    private modelId: string
  ) {}

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const input = {
        inputText: text.substring(0, 8000) // Titan limit
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(input)
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      if (!responseBody.embedding) {
        throw new Error('No embedding in response');
      }

      logger.info('Embedding generated', { 
        dimension: responseBody.embedding.length,
        textLength: text.length 
      });

      return responseBody.embedding;
    } catch (error) {
      logger.error('Failed to generate embedding', error);
      throw new Error('Embedding generation failed');
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Batch embeddings generated', { count: embeddings.length });
    return embeddings;
  }
}
