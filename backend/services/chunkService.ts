import { Logger } from '../utils/logger';

const logger = new Logger('ChunkService');

export interface Chunk {
  text: string;
  chunkNumber: number;
  startIndex: number;
  endIndex: number;
}

export class ChunkService {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize = 700, chunkOverlap = 100) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Split text into overlapping chunks based on token count
   * Approximation: 1 token ≈ 4 characters
   */
  chunkText(text: string): Chunk[] {
    const chunks: Chunk[] = [];
    const charSize = this.chunkSize * 4;
    const charOverlap = this.chunkOverlap * 4;
    
    let startIndex = 0;
    let chunkNumber = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + charSize, text.length);
      let chunkText = text.substring(startIndex, endIndex);

      // Try to break at sentence boundary
      if (endIndex < text.length) {
        const lastPeriod = chunkText.lastIndexOf('. ');
        const lastNewline = chunkText.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > charSize * 0.7) {
          chunkText = chunkText.substring(0, breakPoint + 1);
        }
      }

      chunks.push({
        text: chunkText.trim(),
        chunkNumber: chunkNumber++,
        startIndex,
        endIndex: startIndex + chunkText.length
      });

      startIndex += chunkText.length - charOverlap;
      
      if (startIndex >= text.length) break;
    }

    logger.info('Text chunked successfully', { 
      totalChunks: chunks.length,
      avgChunkSize: Math.round(chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length)
    });

    return chunks;
  }
}
