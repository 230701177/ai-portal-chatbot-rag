import { APIGatewayProxyHandler } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';
import { opensearchClient, config } from '../config/aws';
import { VectorService } from '../services/vectorService';

const logger = new Logger('DeleteDocument');

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const documentId = event.pathParameters?.documentId;

    if (!documentId) {
      return errorResponse('documentId is required', 400);
    }

    logger.info('Deleting document', { documentId });

    const vectorService = new VectorService(opensearchClient, config.opensearchIndex);
    await vectorService.deleteByDocumentName(documentId);

    logger.info('Document deleted successfully', { documentId });

    return successResponse({
      message: 'Document deleted successfully',
      documentId
    });

  } catch (error: any) {
    logger.error('Failed to delete document', error);
    return errorResponse('Failed to delete document', 500, { message: error.message });
  }
};
