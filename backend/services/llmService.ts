import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Logger } from '../utils/logger';
import { SearchResult } from './vectorService';

const logger = new Logger('LLMService');

export interface LLMResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export class LLMService {
  constructor(
    private bedrockClient: BedrockRuntimeClient,
    private modelId: string
  ) {}

  async generateAnswer(question: string, context: SearchResult[]): Promise<LLMResponse> {
    try {
      const prompt = this.constructPrompt(question, context);
      
      const input = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(input)
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const answer = responseBody.content[0].text;
      const sources = this.extractSources(context);
      const confidence = this.calculateConfidence(context);

      logger.info('Answer generated', { 
        questionLength: question.length,
        answerLength: answer.length,
        confidence 
      });

      return { answer, sources, confidence };
    } catch (error) {
      logger.error('Failed to generate answer', error);
      throw new Error('Answer generation failed');
    }
  }

  private constructPrompt(question: string, context: SearchResult[]): string {
    const contextText = context
      .map((result, idx) => `[${idx + 1}] ${result.text} (Source: ${result.document_name}, Chunk: ${result.chunk_number})`)
      .join('\n\n');

    return `You are a professional AI assistant for a government portal. Your task is to answer questions based ONLY on the provided context.

STRICT RULES:
1. Answer ONLY using information from the context below
2. If the answer is not in the context, respond: "Information not found in uploaded documents."
3. Be concise and professional
4. Cite sources using [1], [2], etc. format
5. Do not make assumptions or add external knowledge

Context:
${contextText}

Question: ${question}

Answer:`;
  }

  private extractSources(context: SearchResult[]): string[] {
    const sources = new Set<string>();
    context.forEach(result => {
      sources.add(`${result.document_name} - Chunk ${result.chunk_number}`);
    });
    return Array.from(sources);
  }

  private calculateConfidence(context: SearchResult[]): number {
    if (context.length === 0) return 0;
    
    const avgScore = context.reduce((sum, result) => sum + result.score, 0) / context.length;
    
    // Normalize score to 0-1 range (OpenSearch cosine similarity is typically 0-2)
    const confidence = Math.min(avgScore / 2, 1);
    
    return Math.round(confidence * 100) / 100;
  }
}
