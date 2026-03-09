// Mock Database System - In-Memory + localStorage persistence

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  status: 'Indexed' | 'Processing' | 'Failed';
  chunks: number;
  indexed_at: string;
  userId: string;
  content?: string; // Simulated content
}

export interface ChatMessage {
  id: string;
  userId: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  createdAt: string;
}

export interface Database {
  users: User[];
  documents: Document[];
  chatMessages: ChatMessage[];
  logs: any[];
}

const DB_KEY = 'ai_portal_mock_db';
const AUTH_KEY = 'ai_portal_auth_token';

// Initialize database with seed data
const initializeDB = (): Database => {
  return {
    users: [
      {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@aiportal.com',
        password: 'admin123', // In real app, this would be hashed
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-001',
        name: 'Demo User',
        email: 'demo@aiportal.com',
        password: 'demo123',
        role: 'user',
        createdAt: new Date().toISOString(),
      },
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'Q3_Financial_Report.pdf',
        status: 'Indexed',
        chunks: 45,
        indexed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        userId: 'admin-001',
        content: `Q3 Financial Report - Executive Summary

Operational Efficiency: Our Q3 results demonstrate significant operational improvements with efficiency increasing by 15% compared to Q2. This improvement is attributed to streamlined processes and enhanced automation across key departments.

Revenue Performance: Revenue remained stable in the APAC region despite market volatility. Total revenue for Q3 reached $45.2M, representing a 3% increase year-over-year.

Cost Analysis: Fuel surcharge impact reduced our margin by 2.4%. Transportation costs increased by 8% due to rising fuel prices and supply chain disruptions. We have implemented cost optimization strategies to mitigate these impacts in Q4.

Key Metrics:
- Gross Margin: 42.3%
- Operating Margin: 18.7%
- Net Profit: $8.4M
- EBITDA: $12.1M

Regional Performance:
- North America: +5% growth
- APAC: Stable, maintained market share
- Europe: -2% decline due to economic headwinds

Strategic Initiatives: We continue to invest in digital transformation and sustainability initiatives. Our new AI-powered analytics platform has improved forecasting accuracy by 23%.

Outlook: We maintain a positive outlook for Q4 with projected revenue growth of 6-8%. Focus areas include market expansion, operational excellence, and customer retention.`,
      },
      {
        id: 'doc-002',
        name: 'Admission_Policy_2026.pdf',
        status: 'Indexed',
        chunks: 32,
        indexed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        userId: 'admin-001',
        content: `Admission Policy 2026 - Complete Guidelines

Eligibility Criteria:
Candidates seeking admission must meet the following requirements:

1. Academic Requirements:
   - Minimum 60% marks in qualifying examination (10+2 or equivalent)
   - Mathematics and Science subjects mandatory for technical programs
   - English proficiency required (minimum 50% in English)

2. Entrance Examination:
   - Valid entrance test score required from approved testing agencies
   - Minimum qualifying score: 65th percentile
   - Test covers: Aptitude, Reasoning, Subject Knowledge, English

3. Age Limit:
   - Minimum age: 18 years as of December 31, 2026
   - Maximum age: 25 years for general category
   - Age relaxation of 5 years for reserved categories

Application Process:
1. Online application through official portal (www.admissions.edu)
2. Upload required documents (certificates, ID proof, photographs)
3. Pay application fee: $50 (non-refundable)
4. Submit application before deadline: March 31, 2026

Required Documents:
- 10th and 12th mark sheets
- Transfer certificate
- Character certificate
- Caste certificate (if applicable)
- Income certificate (for fee concession)
- Entrance test scorecard
- Recent passport-size photographs

Selection Process:
- Merit-based selection using entrance test scores
- Personal interview for shortlisted candidates
- Final selection based on combined score (70% test + 30% interview)

Reservation Policy:
- SC/ST: 22.5%
- OBC: 27%
- EWS: 10%
- PWD: 5%
- Sports quota: 3%

Important Dates:
- Application start: January 1, 2026
- Application deadline: March 31, 2026
- Entrance test: April 15-20, 2026
- Results announcement: May 10, 2026
- Counseling: May 20-30, 2026
- Classes begin: July 1, 2026

Fee Structure:
- Tuition fee: $5,000 per year
- Hostel fee: $2,000 per year
- Other charges: $500 per year
- Total: $7,500 per year

Scholarships Available:
- Merit scholarship: Up to 100% tuition waiver
- Need-based scholarship: Up to 50% fee concession
- Sports scholarship: Up to 75% fee waiver

Contact Information:
Admissions Office
Email: admissions@university.edu
Phone: +1-800-ADMIT-26
Office Hours: 9 AM - 5 PM (Monday to Friday)`,
      },
      {
        id: 'doc-003',
        name: 'Technical_Manual_v2.pdf',
        status: 'Indexed',
        chunks: 67,
        indexed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        userId: 'admin-001',
        content: `Technical Manual v2.0 - System Configuration Guide

System Requirements:
- Node.js 18+ (LTS version recommended)
- npm 9+ or yarn 1.22+
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

Prerequisites:
1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Valid AWS credentials with access to:
   - Amazon S3
   - Amazon OpenSearch
   - AWS Lambda
   - Amazon Bedrock
   - DynamoDB
   - CloudWatch

Installation Steps:

1. Clone Repository:
   git clone https://github.com/your-org/ai-portal-assistant.git
   cd ai-portal-assistant

2. Install Dependencies:
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install

3. Configure Environment Variables:
   
   Backend (.env):
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   OPENSEARCH_ENDPOINT=https://your-opensearch-domain.region.es.amazonaws.com
   S3_BUCKET_NAME=your-document-bucket
   BEDROCK_MODEL_ID=anthropic.claude-v2
   DYNAMODB_TABLE=ai-portal-metadata
   
   Frontend (.env.local):
   NEXT_PUBLIC_API_URL=https://your-api-gateway.amazonaws.com/dev
   NEXT_PUBLIC_USE_MOCK=false

4. Deploy Backend:
   cd backend
   serverless deploy --stage dev
   
   This will create:
   - Lambda functions for document processing
   - API Gateway endpoints
   - DynamoDB tables
   - CloudWatch log groups

5. Configure OpenSearch:
   - Create OpenSearch domain (t3.small.search minimum)
   - Enable fine-grained access control
   - Create index with vector field mapping
   - Configure security policies

6. Enable Amazon Bedrock:
   - Request model access in AWS Console
   - Enable Claude and Titan models
   - Configure IAM permissions for Lambda

7. Start Frontend:
   cd frontend
   npm run dev
   
   Access at: http://localhost:3000

Configuration Options:

Chunking Parameters:
- Chunk size: 512 tokens (configurable)
- Overlap: 50 tokens
- Separator: Paragraph breaks

Embedding Settings:
- Model: amazon.titan-embed-text-v1
- Dimensions: 1536
- Batch size: 25 documents

Retrieval Settings:
- Top-K: 5 chunks
- Similarity threshold: 0.7
- Re-ranking enabled

LLM Configuration:
- Model: anthropic.claude-v2
- Temperature: 0.7
- Max tokens: 2048
- Top-P: 0.9

Monitoring:
- CloudWatch Logs: Enabled by default
- Metrics: Lambda duration, API latency, error rates
- Alarms: Set for error rate > 5%, latency > 3s

Troubleshooting:

Common Issues:
1. OpenSearch connection timeout
   - Check security group rules
   - Verify VPC configuration
   - Ensure IAM permissions

2. Bedrock access denied
   - Request model access in console
   - Check IAM role permissions
   - Verify region availability

3. Lambda timeout
   - Increase timeout to 5 minutes
   - Optimize chunk processing
   - Use batch operations

4. High costs
   - Use reserved capacity for OpenSearch
   - Implement caching layer
   - Optimize Lambda memory allocation

Performance Optimization:
- Enable CloudFront for frontend
- Use Lambda provisioned concurrency
- Implement Redis caching
- Optimize OpenSearch queries
- Use S3 Transfer Acceleration

Security Best Practices:
- Enable encryption at rest
- Use VPC endpoints
- Implement API authentication
- Regular security audits
- Rotate credentials quarterly

Backup and Recovery:
- S3 versioning enabled
- DynamoDB point-in-time recovery
- OpenSearch automated snapshots
- Regular backup testing

Support:
- Documentation: docs.aiportal.com
- Email: support@aiportal.com
- Slack: aiportal.slack.com
- GitHub Issues: github.com/your-org/ai-portal-assistant/issues`,
      },
    ],
    chatMessages: [],
    logs: [],
  };
};

// Simulate network delay
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random errors (10% chance)
const simulateError = () => {
  if (Math.random() < 0.1) {
    throw new Error('Network error: Request failed');
  }
};

// Get database from localStorage or initialize
export const getDB = (): Database => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  
  const db = initializeDB();
  saveDB(db);
  return db;
};

// Save database to localStorage
export const saveDB = (db: Database): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Reset database to initial state
export const resetDB = (): void => {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(AUTH_KEY);
};

// Generate UUID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// User operations
export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  await delay(1000);
  simulateError();
  
  const db = getDB();
  
  // Check if user exists
  if (db.users.find(u => u.email === email)) {
    throw new Error('User with this email already exists');
  }
  
  const user: User = {
    id: generateId('user'),
    name,
    email,
    password, // In real app, hash this
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  
  db.users.push(user);
  saveDB(db);
  
  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  await delay(500);
  
  const db = getDB();
  return db.users.find(u => u.email === email) || null;
};

export const authenticateUser = async (email: string, password: string): Promise<User> => {
  await delay(800);
  simulateError();
  
  const user = await findUserByEmail(email);
  
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

// Document operations
export const createDocument = async (name: string, userId: string, content?: string): Promise<Document> => {
  await delay(2000); // Simulate longer processing time
  simulateError();
  
  const db = getDB();
  
  const doc: Document = {
    id: generateId('doc'),
    name,
    status: 'Indexed',
    chunks: Math.floor(Math.random() * 50) + 20,
    indexed_at: new Date().toISOString(),
    userId,
    content: content || `Sample content from ${name}`,
  };
  
  db.documents.push(doc);
  saveDB(db);
  
  return doc;
};

export const getDocuments = async (): Promise<Document[]> => {
  await delay(600);
  
  const db = getDB();
  return db.documents;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await delay(800);
  simulateError();
  
  const db = getDB();
  db.documents = db.documents.filter(d => d.id !== documentId);
  saveDB(db);
};

export const getDocumentByName = async (documentName: string): Promise<Document | null> => {
  await delay(300);
  
  const db = getDB();
  return db.documents.find(d => d.name === documentName) || null;
};

// Chat operations
export const createChatMessage = async (
  userId: string,
  question: string
): Promise<ChatMessage> => {
  await delay(1500); // Simulate AI processing time
  simulateError();
  
  const db = getDB();
  
  // Find relevant documents based on keywords
  const keywords = question.toLowerCase().split(' ');
  const relevantDocs = db.documents.filter(doc => {
    const content = (doc.content || '').toLowerCase();
    return keywords.some(keyword => content.includes(keyword));
  });
  
  // Generate mock AI response
  let answer = '';
  let sources: string[] = [];
  let confidence = 0;
  
  if (relevantDocs.length > 0) {
    // Use content from relevant documents
    const doc = relevantDocs[0];
    answer = `Based on the uploaded documents, ${doc.content}`;
    sources = relevantDocs.map(d => `${d.name} - chunk ${Math.floor(Math.random() * d.chunks) + 1}`);
    confidence = 0.85 + Math.random() * 0.15; // 85-100%
  } else {
    // No relevant documents found
    answer = "I couldn't find specific information about that in the uploaded documents. Please upload relevant documents or rephrase your question.";
    sources = [];
    confidence = 0.3;
  }
  
  const message: ChatMessage = {
    id: generateId('msg'),
    userId,
    question,
    answer,
    sources,
    confidence,
    createdAt: new Date().toISOString(),
  };
  
  db.chatMessages.push(message);
  saveDB(db);
  
  return message;
};

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  await delay(500);
  
  const db = getDB();
  return db.chatMessages.filter(m => m.userId === userId);
};

// Auth token operations
export const saveAuthToken = (userId: string): void => {
  const token = `mock_token_${userId}_${Date.now()}`;
  localStorage.setItem(AUTH_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  await delay(300);
  
  if (!token || !token.startsWith('mock_token_')) {
    return null;
  }
  
  // Extract user ID from token
  const parts = token.split('_');
  if (parts.length < 3) return null;
  
  const userId = parts[2];
  const db = getDB();
  
  return db.users.find(u => u.id === userId) || null;
};
