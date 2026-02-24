import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes for document ingestion
});

export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  answer: string;
  sources: string[];
  confidence: number;
  retrieved_chunks?: number;
}

export interface IngestRequest {
  fileName: string;
  fileContent: string; // base64
}

export interface IngestResponse {
  status: string;
  documentId: string;
  fileName: string;
  total_chunks: number;
  message: string;
}

export interface Document {
  name: string;
  chunks: number;
  indexed_at: string;
  status: string;
}

export const chatService = {
  async query(question: string): Promise<QueryResponse> {
    try {
      const response = await api.post<QueryResponse>('/query', { question });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export const documentService = {
  async ingest(fileName: string, fileContent: string): Promise<IngestResponse> {
    try {
      const response = await api.post<IngestResponse>('/ingest', {
        fileName,
        fileContent,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async list(): Promise<Document[]> {
    try {
      const response = await api.get<{ documents: Document[] }>('/documents');
      return response.data.documents;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(documentId: string): Promise<void> {
    try {
      await api.delete(`/documents/${documentId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

function handleApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.error) {
      return new Error(axiosError.response.data.error);
    }
    if (axiosError.message) {
      return new Error(axiosError.message);
    }
  }
  return new Error('An unexpected error occurred');
}
