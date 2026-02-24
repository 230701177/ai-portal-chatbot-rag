import { Client } from '@opensearch-project/opensearch';
import { Logger } from '../utils/logger';

const logger = new Logger('VectorService');

export interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  document_name: string;
  chunk_number: number;
  created_at: string;
}

export interface SearchResult {
  id: string;
  text: string;
  document_name: string;
  chunk_number: number;
  score: number;
}

export class VectorService {
  constructor(
    private client: Client,
    private indexName: string
  ) {}

  async ensureIndex(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      
      if (!exists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              index: {
                knn: true,
                'knn.algo_param.ef_search': 512
              }
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                text: { type: 'text' },
                embedding: {
                  type: 'knn_vector',
                  dimension: 1536,
                  method: {
                    name: 'hnsw',
                    space_type: 'cosinesimil',
                    engine: 'nmslib'
                  }
                },
                document_name: { type: 'keyword' },
                chunk_number: { type: 'integer' },
                created_at: { type: 'date' }
              }
            }
          }
        });
        logger.info('Index created', { indexName: this.indexName });
      }
    } catch (error) {
      logger.error('Failed to ensure index', error);
      throw error;
    }
  }

  async indexDocuments(documents: VectorDocument[]): Promise<void> {
    try {
      const body = documents.flatMap(doc => [
        { index: { _index: this.indexName, _id: doc.id } },
        doc
      ]);

      const response = await this.client.bulk({ body });

      if (response.body.errors) {
        logger.error('Bulk indexing had errors', response.body.items);
        throw new Error('Some documents failed to index');
      }

      logger.info('Documents indexed successfully', { count: documents.length });
    } catch (error) {
      logger.error('Failed to index documents', error);
      throw error;
    }
  }

  async search(queryEmbedding: number[], k: number = 5): Promise<SearchResult[]> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          size: k,
          query: {
            knn: {
              embedding: {
                vector: queryEmbedding,
                k: k
              }
            }
          }
        }
      });

      const results: SearchResult[] = response.body.hits.hits.map((hit: any) => ({
        id: hit._id,
        text: hit._source.text,
        document_name: hit._source.document_name,
        chunk_number: hit._source.chunk_number,
        score: hit._score
      }));

      logger.info('Search completed', { 
        resultsCount: results.length,
        topScore: results[0]?.score 
      });

      return results;
    } catch (error) {
      logger.error('Search failed', error);
      throw error;
    }
  }

  async deleteByDocumentName(documentName: string): Promise<void> {
    try {
      await this.client.deleteByQuery({
        index: this.indexName,
        body: {
          query: {
            term: { document_name: documentName }
          }
        }
      });

      logger.info('Documents deleted', { documentName });
    } catch (error) {
      logger.error('Failed to delete documents', error);
      throw error;
    }
  }
}
