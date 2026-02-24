import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { S3Client } from '@aws-sdk/client-s3';
import { Client } from '@opensearch-project/opensearch';

const REGION = process.env.BEDROCK_REGION || 'us-east-1';

// Initialize AWS clients
export const bedrockClient = new BedrockRuntimeClient({ region: REGION });
export const s3Client = new S3Client({ region: REGION });

// Initialize OpenSearch client
export const opensearchClient = new Client({
  node: process.env.OPENSEARCH_ENDPOINT || '',
  ssl: {
    rejectUnauthorized: false
  }
});

export const config = {
  s3Bucket: process.env.S3_BUCKET || '',
  opensearchIndex: process.env.OPENSEARCH_INDEX || 'portal_knowledge',
  embeddingModelId: process.env.EMBEDDING_MODEL_ID || 'amazon.titan-embed-text-v1',
  llmModelId: process.env.LLM_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
  chunkSize: 700,
  chunkOverlap: 100,
  topK: 5,
  similarityThreshold: 0.7
};
