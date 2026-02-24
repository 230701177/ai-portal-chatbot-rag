import { APIGatewayProxyHandler } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';
import { opensearchClient, config } from '../config/aws';

const logger = new Logger('ListDocuments');

export const handler: APIGatewayProxyHandler = async () => {
  try {
    logger.info('Listing documents');

    const response = await opensearchClient.search({
      index: config.opensearchIndex,
      body: {
        size: 0,
        aggs: {
          documents: {
            terms: {
              field: 'document_name',
              size: 100
            },
            aggs: {
              chunk_count: {
                value_count: {
                  field: 'chunk_number'
                }
              },
              latest_date: {
                max: {
                  field: 'created_at'
                }
              }
            }
          }
        }
      }
    });

    const documents = response.body.aggregations.documents.buckets.map((bucket: any) => ({
      name: bucket.key,
      chunks: bucket.chunk_count.value,
      indexed_at: bucket.latest_date.value_as_string,
      status: 'Indexed'
    }));

    logger.info('Documents listed', { count: documents.length });

    return successResponse({ documents });

  } catch (error: any) {
    logger.error('Failed to list documents', error);
    return errorResponse('Failed to list documents', 500, { message: error.message });
  }
};
