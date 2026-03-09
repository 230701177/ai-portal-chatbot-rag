// Mock API Service - Simulates AWS backend calls
import {
  createChatMessage,
  createDocument,
  getDocuments,
  deleteDocument as deleteDocFromDB,
  authenticateUser,
  createUser,
  saveAuthToken,
  removeAuthToken,
  getUserFromToken,
  getAuthToken,
} from './mockDatabase';

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

// Mock Chat Service
export const mockChatService = {
  async query(question: string): Promise<QueryResponse> {
    // Get current user or auto-login as demo user
    let token = getAuthToken();
    if (!token) {
      // Auto-login as demo user for convenience
      token = `mock_token_user-001_${Date.now()}`;
      localStorage.setItem('ai_portal_auth_token', token);
    }

    let user = await getUserFromToken(token);
    if (!user) {
      // If token is invalid, create a new one
      token = `mock_token_user-001_${Date.now()}`;
      localStorage.setItem('ai_portal_auth_token', token);
      user = await getUserFromToken(token);
      if (!user) {
        throw new Error('Failed to authenticate user');
      }
    }

    // Create chat message (includes AI response generation)
    const message = await createChatMessage(user.id, question);

    return {
      answer: message.answer,
      sources: message.sources,
      confidence: message.confidence,
      retrieved_chunks: message.sources.length,
    };
  },
};

// Mock Document Service
export const mockDocumentService = {
  async ingest(fileName: string, fileContent: string): Promise<IngestResponse> {
    // Get current user or auto-login as admin
    let token = getAuthToken();
    if (!token) {
      // Auto-login as admin user for convenience
      token = `mock_token_admin-001_${Date.now()}`;
      localStorage.setItem('ai_portal_auth_token', token);
    }

    let user = await getUserFromToken(token);
    if (!user) {
      // If token is invalid, create a new one
      token = `mock_token_admin-001_${Date.now()}`;
      localStorage.setItem('ai_portal_auth_token', token);
      user = await getUserFromToken(token);
      if (!user) {
        throw new Error('Failed to authenticate user');
      }
    }

    // Simulate PDF content extraction
    const mockContent = `Content extracted from ${fileName}. This document contains important information about the topic.`;

    // Create document
    const doc = await createDocument(fileName, user.id, mockContent);

    return {
      status: 'success',
      documentId: doc.id,
      fileName: doc.name,
      total_chunks: doc.chunks,
      message: `Document ${fileName} successfully indexed with ${doc.chunks} chunks`,
    };
  },

  async list(): Promise<Document[]> {
    const docs = await getDocuments();
    return docs.map(doc => ({
      name: doc.name,
      chunks: doc.chunks,
      indexed_at: doc.indexed_at,
      status: doc.status,
    }));
  },

  async delete(documentId: string): Promise<void> {
    await deleteDocFromDB(documentId);
  },
};

// Mock Auth Service
export const mockAuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await authenticateUser(email, password);
    saveAuthToken(user.id);

    return {
      token: `mock_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async signup(name: string, email: string, password: string): Promise<LoginResponse> {
    const user = await createUser(name, email, password);
    saveAuthToken(user.id);

    return {
      token: `mock_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async logout(): Promise<void> {
    removeAuthToken();
  },

  async getCurrentUser() {
    const token = getAuthToken();
    if (!token) return null;

    const user = await getUserFromToken(token);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};
