import axios, { AxiosError } from 'axios';
import {
  mockChatService,
  mockDocumentService,
  mockAuthService,
} from './mockApi';

// Check if mock mode is enabled
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// Real API implementations
const realChatService = {
  async query(question: string): Promise<QueryResponse> {
    try {
      const response = await api.post<QueryResponse>('/query', { question });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

const realDocumentService = {
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

const realAuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async signup(name: string, email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/signup', { name, email, password });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated(): boolean {
    // Check for auth token in localStorage or cookies
    return false; // Implement based on your auth strategy
  },
};

// Export services based on mode
export const chatService = USE_MOCK ? mockChatService : realChatService;
export const documentService = USE_MOCK ? mockDocumentService : realDocumentService;
export const authService = USE_MOCK ? mockAuthService : realAuthService;

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
