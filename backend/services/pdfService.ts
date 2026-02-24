import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import pdfParse from 'pdf-parse';
import { Logger } from '../utils/logger';

const logger = new Logger('PDFService');

export class PDFService {
  constructor(private s3Client: S3Client, private bucket: string) {}

  async uploadPDF(fileBuffer: Buffer, fileName: string, documentId: string): Promise<string> {
    try {
      const key = `documents/${documentId}/${fileName}`;
      
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/pdf'
      }));

      logger.info('PDF uploaded successfully', { key, documentId });
      return key;
    } catch (error) {
      logger.error('Failed to upload PDF', error);
      throw new Error('PDF upload failed');
    }
  }

  async extractText(fileBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(fileBuffer);
      const text = data.text.trim();
      
      if (!text) {
        throw new Error('No text extracted from PDF');
      }

      logger.info('Text extracted successfully', { 
        pages: data.numpages,
        textLength: text.length 
      });
      
      return text;
    } catch (error) {
      logger.error('Failed to extract text from PDF', error);
      throw new Error('PDF text extraction failed');
    }
  }

  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
