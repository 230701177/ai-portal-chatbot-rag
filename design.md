# Design Document: RAG Chatbot for Government Portals

## Overview

This document describes the technical design for an AI-powered RAG (Retrieval-Augmented Generation) chatbot system built on AWS services. The system enables users to query large document repositories and receive accurate, document-grounded answers with source citations.

The architecture follows a serverless, event-driven design pattern with two primary pipelines:

1. **Document Pipeline**: Ingests documents, extracts text, generates embeddings, and indexes them for retrieval
2. **Query Pipeline**: Processes user queries, retrieves relevant context, and generates answers using an LLM

### Key Design Principles

- **Serverless-first**: Leverage AWS Lambda and managed services to minimize operational overhead
- **Event-driven**: Use S3 events and asynchronous processing for document ingestion
- **Separation of concerns**: Clear boundaries between ingestion, retrieval, and generation
- **Observability**: Comprehensive logging and metrics for monitoring and debugging
- **Cost optimization**: Use appropriate service tiers and caching strategies

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Document Pipeline                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Upload → S3 → EventBridge → Lambda (Textract) → Lambda (Chunk) │
│                                  ↓                      ↓         │
│                            CloudWatch            OpenSearch       │
│                                                        ↓          │
│                                                   DynamoDB        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Query Pipeline                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User → API Gateway → Lambda (Query Handler)                     │
│                              ↓                                    │
│                    ┌─────────┴─────────┐                        │
│                    ↓                   ↓                         │
│              OpenSearch          Amazon Bedrock                  │
│              (Retrieval)         (Answer Gen)                    │
│                    ↓                   ↓                         │
│                    └─────────┬─────────┘                        │
│                              ↓                                    │
│                        Response + Citations                      │
│                              ↓                                    │
│                    DynamoDB (Query Logs)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Storage**: Amazon S3 (documents), DynamoDB (metadata, logs)
- **Text Extraction**: Amazon Textract
- **Vector Database**: Amazon OpenSearch Service with k-NN plugin
- **Compute**: AWS Lambda (Python 3.11 runtime)
- **API Layer**: Amazon API Gateway (REST API)
- **LLM**: Amazon Bedrock (Claude 3 Sonnet or Titan)
- **Monitoring**: Amazon CloudWatch (logs, metrics, alarms)
- **Event Processing**: Amazon EventBridge

## Components and Interfaces

### 1. Document Upload Handler

**Responsibility**: Handle document uploads and initiate processing pipeline

**Interface**:
```python
def upload_document(file: bytes, filename: str, metadata: dict) -> dict:
    """
    Upload a document to S3 and create metadata record
    
    Args:
        file: Document file bytes
        filename: Original filename
        metadata: Additional metadata (uploader, tags, etc.)
    
    Returns:
        {
            "document_id": str,
            "status": "uploaded",
            "s3_key": str,
            "timestamp": str
        }
    
    Raises:
        ValidationError: If file format is unsupported
        StorageError: If S3 upload fails
    """
```

**Implementation Details**:
- Validates file format (PDF only)
- Generates unique document ID (UUID)
- Uploads to S3 bucket with key pattern: `documents/{document_id}/{filename}`
- Creates DynamoDB record with status "uploaded"
- Returns document ID for tracking

### 2. Text Extraction Handler

**Responsibility**: Extract text from PDF documents using Amazon Textract

**Interface**:
```python
def extract_text(document_id: str, s3_bucket: str, s3_key: str) -> dict:
    """
    Extract text from PDF using Textract
    
    Args:
        document_id: Unique document identifier
        s3_bucket: S3 bucket containing document
        s3_key: S3 key of document
    
    Returns:
        {
            "document_id": str,
            "extracted_text": str,
            "page_count": int,
            "status": "extracted"
        }
    
    Raises:
        TextractError: If text extraction fails
    """
```

**Implementation Details**:
- Invoked by S3 event trigger via EventBridge
- Uses Textract `detect_document_text` API for text extraction
- Preserves page boundaries and text ordering
- Stores extracted text in S3 at `extracted/{document_id}/text.json`
- Updates DynamoDB status to "extracted"
- Implements retry logic (3 attempts with exponential backoff)

### 3. Chunking and Embedding Handler

**Responsibility**: Split text into chunks and generate embeddings

**Interface**:
```python
def chunk_and_embed(document_id: str, text: str, config: ChunkConfig) -> list[Chunk]:
    """
    Chunk text and generate embeddings
    
    Args:
        document_id: Unique document identifier
        text: Extracted text content
        config: Chunking configuration (size, overlap)
    
    Returns:
        List of Chunk objects with embeddings
    
    Raises:
        ChunkingError: If chunking fails
        EmbeddingError: If embedding generation fails
    """

class Chunk:
    chunk_id: str
    document_id: str
    text: str
    embedding: list[float]
    metadata: dict  # page_number, chunk_index, etc.
```

**Implementation Details**:
- Uses sliding window approach with configurable size (default 512 tokens) and overlap (default 50 tokens)
- Tokenization using tiktoken library (cl100k_base encoding for compatibility with OpenAI-style models)
- Attempts to preserve sentence boundaries using NLTK sentence tokenizer
- Generates embeddings using Amazon Bedrock Titan Embeddings model
- Batch processing: generates embeddings for up to 25 chunks per Bedrock API call
- Each chunk includes metadata: document_id, chunk_index, page_number (if available), character_offset

### 4. Vector Store Manager

**Responsibility**: Store and retrieve document embeddings from OpenSearch

**Interface**:
```python
def index_chunks(chunks: list[Chunk]) -> dict:
    """
    Index chunks in OpenSearch
    
    Args:
        chunks: List of chunks with embeddings
    
    Returns:
        {
            "indexed_count": int,
            "failed_count": int,
            "status": "indexed"
        }
    
    Raises:
        IndexingError: If indexing fails after retries
    """

def search_similar(query_embedding: list[float], k: int, threshold: float) -> list[Chunk]:
    """
    Search for similar chunks using k-NN
    
    Args:
        query_embedding: Query vector embedding
        k: Number of results to return
        threshold: Minimum similarity score (0-1)
    
    Returns:
        List of most similar chunks with scores
    
    Raises:
        SearchError: If search fails
    """
```

**Implementation Details**:
- OpenSearch index configuration:
  - Index name: `portal-documents`
  - Mapping includes: `embedding` (knn_vector), `text` (text), `document_id` (keyword), `metadata` (object)
  - k-NN algorithm: HNSW (Hierarchical Navigable Small World)
  - Distance metric: cosine similarity
  - Dimension: 1536 (for Titan Embeddings)
- Bulk indexing using OpenSearch bulk API (batch size: 100 chunks)
- Retry logic with exponential backoff (3 attempts)
- Updates DynamoDB status to "indexed" after successful indexing

### 5. Query Handler

**Responsibility**: Process user queries and orchestrate retrieval and generation

**Interface**:
```python
def process_query(query: str, user_id: str, config: QueryConfig) -> QueryResponse:
    """
    Process user query and generate answer
    
    Args:
        query: User's natural language question
        user_id: User identifier for logging
        config: Query configuration (k, threshold, model params)
    
    Returns:
        QueryResponse with answer and citations
    
    Raises:
        ValidationError: If query is invalid
        QueryError: If processing fails
    """

class QueryResponse:
    answer: str
    citations: list[Citation]
    retrieved_chunks: list[Chunk]
    metadata: dict  # response_time, token_count, etc.

class Citation:
    document_id: str
    filename: str
    page_number: int | None
    chunk_text: str
    relevance_score: float
```

**Implementation Details**:
- Validates query (non-empty, max 500 characters)
- Generates query embedding using same model as documents
- Retrieves top-k chunks from OpenSearch (default k=5)
- Filters chunks by similarity threshold (default 0.7)
- Constructs prompt for LLM with retrieved context
- Invokes Answer Generator
- Logs query to DynamoDB
- Returns response with answer and citations

### 6. Answer Generator

**Responsibility**: Generate answers using Amazon Bedrock LLM

**Interface**:
```python
def generate_answer(query: str, context_chunks: list[Chunk], config: LLMConfig) -> str:
    """
    Generate answer using LLM
    
    Args:
        query: User's question
        context_chunks: Retrieved relevant chunks
        config: LLM configuration (model, temperature, max_tokens)
    
    Returns:
        Generated answer text
    
    Raises:
        GenerationError: If LLM invocation fails
    """
```

**Implementation Details**:
- Uses Amazon Bedrock with Claude 3 Sonnet model (default)
- Prompt template:
  ```
  You are a helpful assistant for a government portal. Answer the user's question based ONLY on the provided context. If the context doesn't contain enough information, say so.
  
  Context:
  {context_chunks}
  
  Question: {query}
  
  Answer:
  ```
- LLM parameters:
  - Temperature: 0.3 (low for factual accuracy)
  - Max tokens: 500
  - Top-p: 0.9
- Implements timeout (30 seconds)
- Retry logic for transient failures (3 attempts)

### 7. Citation Builder

**Responsibility**: Extract and format source citations from retrieved chunks

**Interface**:
```python
def build_citations(chunks: list[Chunk], document_metadata: dict) -> list[Citation]:
    """
    Build citation list from retrieved chunks
    
    Args:
        chunks: Retrieved chunks with scores
        document_metadata: Document information from DynamoDB
    
    Returns:
        List of formatted citations
    """
```

**Implementation Details**:
- Retrieves document metadata from DynamoDB (filename, upload date)
- Consolidates multiple chunks from same document
- Sorts citations by relevance score
- Formats citations with document name, page number, and excerpt
- Includes relevance score for transparency

### 8. Query Logger

**Responsibility**: Log queries and metrics to DynamoDB

**Interface**:
```python
def log_query(query_log: QueryLog) -> None:
    """
    Log query and metrics to DynamoDB
    
    Args:
        query_log: Query log entry with metrics
    """

class QueryLog:
    query_id: str
    timestamp: str
    user_id: str
    query_text: str
    response_time_ms: int
    retrieved_count: int
    answer_length: int
    token_count: int
    error: str | None
```

**Implementation Details**:
- DynamoDB table: `query-logs`
- Partition key: `query_id` (UUID)
- Sort key: `timestamp` (ISO 8601)
- GSI on `user_id` for user-specific analytics
- TTL enabled (90 days retention)
- Asynchronous logging (non-blocking)

## Data Models

### DynamoDB Tables

#### Document Metadata Table

**Table Name**: `document-metadata`

**Schema**:
```python
{
    "document_id": str,        # Partition key (UUID)
    "filename": str,
    "upload_timestamp": str,   # ISO 8601
    "status": str,             # uploaded | extracted | indexed | failed
    "s3_bucket": str,
    "s3_key": str,
    "page_count": int,
    "chunk_count": int,
    "uploader_id": str,
    "tags": list[str],
    "error_message": str | None,
    "last_updated": str        # ISO 8601
}
```

**Indexes**:
- GSI on `status` for filtering documents by processing status
- GSI on `upload_timestamp` for time-based queries

#### Query Logs Table

**Table Name**: `query-logs`

**Schema**:
```python
{
    "query_id": str,           # Partition key (UUID)
    "timestamp": str,          # Sort key (ISO 8601)
    "user_id": str,
    "query_text": str,
    "answer_text": str,
    "response_time_ms": int,
    "retrieved_count": int,
    "avg_similarity_score": float,
    "token_count": int,
    "model_used": str,
    "error": str | None,
    "ttl": int                 # Unix timestamp for TTL
}
```

**Indexes**:
- GSI on `user_id` and `timestamp` for user analytics

### OpenSearch Index Schema

**Index Name**: `portal-documents`

**Mapping**:
```json
{
  "mappings": {
    "properties": {
      "chunk_id": {"type": "keyword"},
      "document_id": {"type": "keyword"},
      "text": {
        "type": "text",
        "analyzer": "standard"
      },
      "embedding": {
        "type": "knn_vector",
        "dimension": 1536,
        "method": {
          "name": "hnsw",
          "space_type": "cosinesimil",
          "engine": "nmslib",
          "parameters": {
            "ef_construction": 128,
            "m": 16
          }
        }
      },
      "metadata": {
        "type": "object",
        "properties": {
          "page_number": {"type": "integer"},
          "chunk_index": {"type": "integer"},
          "character_offset": {"type": "integer"},
          "filename": {"type": "keyword"}
        }
      },
      "indexed_at": {"type": "date"}
    }
  }
}
```

### S3 Bucket Structure

**Bucket Name**: `portal-rag-documents-{account-id}`

**Key Structure**:
```
documents/{document_id}/{filename}           # Original uploaded documents
extracted/{document_id}/text.json            # Extracted text from Textract
extracted/{document_id}/metadata.json        # Extraction metadata
```

## API Specifications

### REST API Endpoints

#### 1. Query Endpoint

**Endpoint**: `POST /query`

**Request**:
```json
{
  "query": "What are the admission requirements?",
  "user_id": "user123",
  "config": {
    "top_k": 5,
    "similarity_threshold": 0.7,
    "model": "claude-3-sonnet"
  }
}
```

**Response** (200 OK):
```json
{
  "query_id": "uuid",
  "answer": "Based on the admission guidelines...",
  "citations": [
    {
      "document_id": "doc123",
      "filename": "admission_guide_2024.pdf",
      "page_number": 3,
      "excerpt": "Applicants must have...",
      "relevance_score": 0.89
    }
  ],
  "metadata": {
    "response_time_ms": 1234,
    "retrieved_count": 5,
    "token_count": 245
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "ValidationError",
  "message": "Query exceeds maximum length of 500 characters"
}
```

#### 2. Document Upload Endpoint

**Endpoint**: `POST /documents/upload`

**Request**: Multipart form data
- `file`: PDF file (binary)
- `metadata`: JSON string with optional fields (tags, description)

**Response** (201 Created):
```json
{
  "document_id": "uuid",
  "status": "uploaded",
  "s3_key": "documents/uuid/filename.pdf",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 3. Document Status Endpoint

**Endpoint**: `GET /documents/{document_id}/status`

**Response** (200 OK):
```json
{
  "document_id": "uuid",
  "filename": "admission_guide.pdf",
  "status": "indexed",
  "upload_timestamp": "2024-01-15T10:30:00Z",
  "page_count": 25,
  "chunk_count": 150,
  "last_updated": "2024-01-15T10:35:00Z"
}
```

## Error Handling

### Error Categories

1. **Validation Errors**: Invalid input (empty query, unsupported file format)
2. **Service Errors**: AWS service failures (Textract, Bedrock, OpenSearch)
3. **Resource Errors**: Resource limits exceeded (Lambda timeout, DynamoDB throttling)
4. **System Errors**: Unexpected failures (network issues, configuration errors)

### Error Handling Strategy

#### Retry Logic

**Exponential Backoff Configuration**:
```python
def exponential_backoff(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    """Calculate delay with exponential backoff and jitter"""
    delay = min(base_delay * (2 ** attempt), max_delay)
    jitter = random.uniform(0, delay * 0.1)
    return delay + jitter
```

**Retry Policy by Service**:
- Textract: 3 attempts, base delay 2s
- Bedrock: 3 attempts, base delay 1s
- OpenSearch: 3 attempts, base delay 1s
- DynamoDB: 5 attempts (built-in AWS SDK retry)

#### Circuit Breaker Pattern

For external service calls (Bedrock, OpenSearch):
- Failure threshold: 5 consecutive failures
- Timeout: 30 seconds
- Half-open retry: After 60 seconds

#### Error Logging

All errors logged to CloudWatch with structured format:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "component": "TextExtractor",
  "error_type": "TextractError",
  "message": "Failed to extract text from document",
  "document_id": "uuid",
  "attempt": 3,
  "stack_trace": "..."
}
```

### User-Facing Error Messages

- **Validation errors**: Return specific validation message
- **Service errors**: "We're experiencing technical difficulties. Please try again."
- **No results found**: "I couldn't find relevant information in the documents. Please try rephrasing your question."
- **Timeout**: "The request is taking longer than expected. Please try again."



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Document Upload and Storage Consistency

*For any* valid PDF document, when uploaded to the system, the document should be stored in S3 and a corresponding metadata record should be created in DynamoDB with all required fields (document_id, filename, upload_timestamp, status, s3_bucket, s3_key).

**Validates: Requirements 1.1, 1.4**

### Property 2: Input Validation Rejects Invalid Inputs

*For any* file with a non-PDF extension or any query that is empty or exceeds 500 characters, the system should reject the input and return a descriptive validation error without processing.

**Validates: Requirements 1.2, 1.3, 5.1, 5.5**

### Property 3: Pipeline Status Tracking

*For any* document progressing through the pipeline, the document status in DynamoDB should be updated to reflect the current processing stage (uploaded → extracted → indexed), and the status should never regress to an earlier stage.

**Validates: Requirements 2.5, 3.5**

### Property 4: Text Extraction Preserves Order

*For any* PDF document with known text ordering, the extracted text should preserve the logical sequence of content as it appears in the original document.

**Validates: Requirements 2.3**

### Property 5: Chunking Respects Configuration

*For any* text and chunking configuration (size, overlap), the generated chunks should have sizes within the configured limits, and consecutive chunks should overlap by the specified number of tokens.

**Validates: Requirements 3.1**

### Property 6: Chunking Preserves Semantic Boundaries

*For any* text with clear paragraph or sentence boundaries, chunks should not split sentences or paragraphs unless necessary to meet size constraints.

**Validates: Requirements 3.2**

### Property 7: Embedding Dimension Consistency

*For any* chunk or query, the generated embedding vector should have the same dimensionality (1536 for Titan Embeddings) and use the same embedding model throughout the system.

**Validates: Requirements 3.3, 5.2**

### Property 8: Data Persistence with Complete Metadata

*For any* chunk stored in OpenSearch, the record should include the embedding vector, source text, document_id, and all metadata fields (page_number, chunk_index, character_offset, filename).

**Validates: Requirements 3.4, 4.2, 5.4**

### Property 9: Vector Search Returns Top-K by Similarity

*For any* query embedding and retrieval configuration (k, threshold), the Vector_Store should return exactly k chunks (or fewer if below threshold) ranked by cosine similarity in descending order.

**Validates: Requirements 4.3, 5.3**

### Property 10: Retry Logic with Exponential Backoff

*For any* external service call that fails (Textract, Bedrock, OpenSearch), the system should retry up to 3 times with exponentially increasing delays between attempts before marking the operation as failed.

**Validates: Requirements 4.4, 10.2**

### Property 11: Error Handling Maintains System Stability

*For any* error encountered during document processing, the system should log the error to CloudWatch, update the document status appropriately, and continue processing other documents without crashing.

**Validates: Requirements 1.5, 2.4, 4.5, 10.1, 10.4**

### Property 12: Prompt Construction Includes Query and Context

*For any* query and set of retrieved chunks, the constructed prompt should include both the user's query and all retrieved chunk texts as context.

**Validates: Requirements 6.1, 6.3**

### Property 13: Answer Generation Returns Response

*For any* valid prompt sent to Amazon Bedrock, the Answer_Generator should return a non-empty answer text or an appropriate error message.

**Validates: Requirements 6.4**

### Property 14: Citation Completeness and Format

*For any* answer generated from retrieved chunks, the response should include citations for all source documents used, with each citation containing document_id, filename, and relevance_score, and citations from the same document should be consolidated.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 15: Query Logging Completeness

*For any* processed query, a log entry should be created in DynamoDB containing query_text, timestamp, user_id, response_time, retrieval metrics (retrieved_count, avg_similarity_score), and generation metrics (token_count, model_used).

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 16: API Authentication Validation

*For any* API request, the system should validate the authentication token and return 401 Unauthorized if the token is invalid or missing.

**Validates: Requirements 9.4**

### Property 17: Error Response Status Codes

*For any* API request that fails, the system should return the appropriate HTTP status code: 400 for validation errors, 401 for authentication failures, 500 for server errors.

**Validates: Requirements 9.5**

### Property 18: Error Messages Hide Internal Details

*For any* error that exhausts retry attempts, the user-facing error message should be generic and should not expose internal system details, stack traces, or service names.

**Validates: Requirements 10.3**

### Property 19: Metrics Emission for Observability

*For any* document processed or query executed, the system should emit CloudWatch metrics for throughput, latency, error rates, and token usage.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 20: Critical Error Alarm Triggering

*For any* critical error (e.g., service unavailable, authentication failure, data corruption), the system should trigger a CloudWatch alarm for operator notification.

**Validates: Requirements 11.5**

### Property 21: Asynchronous Document Processing

*For any* batch of documents uploaded simultaneously, the Document_Pipeline should process them asynchronously and independently, with one document's failure not blocking others.

**Validates: Requirements 12.2**

### Property 22: Configuration Application Without Redeployment

*For any* configuration parameter change (chunk size, top-k, LLM temperature), the system should apply the new configuration to subsequent requests without requiring code redeployment.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points between components
- **Property-based tests**: Verify universal properties across all inputs through randomized testing

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property-based tests verify general correctness across a wide input space.

### Property-Based Testing Framework

**Framework**: Hypothesis (Python)

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test references its design document property
- Tag format: `# Feature: rag-chatbot-portal, Property {number}: {property_text}`

**Example Property Test Structure**:
```python
from hypothesis import given, strategies as st
import pytest

@given(
    document=st.binary(min_size=100, max_size=10000),
    filename=st.text(min_size=1, max_size=255).filter(lambda x: x.endswith('.pdf'))
)
@pytest.mark.property_test
def test_property_1_document_upload_consistency(document, filename):
    """
    Feature: rag-chatbot-portal, Property 1: Document Upload and Storage Consistency
    
    For any valid PDF document, when uploaded to the system, the document should be 
    stored in S3 and a corresponding metadata record should be created in DynamoDB.
    """
    # Upload document
    result = upload_document(document, filename, {})
    
    # Verify S3 storage
    assert s3_client.object_exists(result['s3_key'])
    
    # Verify DynamoDB metadata
    metadata = dynamodb_client.get_item(result['document_id'])
    assert metadata['filename'] == filename
    assert metadata['status'] == 'uploaded'
    assert 'upload_timestamp' in metadata
    assert metadata['s3_key'] == result['s3_key']
```

### Unit Testing Strategy

**Framework**: pytest

**Coverage Areas**:
1. **Component Integration**: Test interactions between components (e.g., Query Handler → Retriever → Answer Generator)
2. **Edge Cases**: Empty documents, single-word queries, documents with no text
3. **Error Conditions**: Service timeouts, invalid responses, malformed data
4. **API Contracts**: Request/response format validation, status codes
5. **Mock External Services**: Mock Textract, Bedrock, OpenSearch for isolated testing

**Example Unit Test**:
```python
def test_empty_query_returns_validation_error():
    """Test that empty queries are rejected with validation error"""
    response = process_query("", "user123", default_config)
    assert response['error'] == 'ValidationError'
    assert 'empty' in response['message'].lower()

def test_no_results_returns_appropriate_message():
    """Test edge case: no relevant chunks found"""
    # Mock OpenSearch to return no results
    with mock.patch('opensearch_client.search', return_value=[]):
        response = process_query("obscure query", "user123", default_config)
        assert 'no relevant information' in response['answer'].lower()
```

### Integration Testing

**Scope**: End-to-end workflows using LocalStack for AWS service mocking

**Test Scenarios**:
1. Complete document pipeline: Upload → Extract → Chunk → Embed → Index
2. Complete query pipeline: Query → Embed → Retrieve → Generate → Respond
3. Error recovery: Failed extraction with retry and eventual success
4. Multi-document queries: Answers citing multiple sources

### Performance Testing

**Tools**: Locust for load testing

**Metrics**:
- Query latency (p50, p95, p99)
- Document processing throughput
- Concurrent user capacity
- Token usage and costs

**Targets**:
- 95% of queries return within 5 seconds
- Support 100 concurrent users
- Process 50 documents per hour

### Test Data Strategy

**Document Test Data**:
- Sample PDFs with known content (government forms, FAQs, circulars)
- Edge cases: empty PDFs, single-page PDFs, 100+ page PDFs
- Malformed PDFs for error testing

**Query Test Data**:
- Common questions from target domains (admissions, services, policies)
- Edge cases: single-word queries, very long queries, non-English queries
- Adversarial queries: injection attempts, prompt manipulation

### Continuous Testing

**CI/CD Integration**:
- Run unit tests and property tests on every commit
- Run integration tests on pull requests
- Run performance tests weekly
- Monitor test coverage (target: 80%+ for core components)

**Test Environments**:
- Local: LocalStack for AWS services
- CI: GitHub Actions with LocalStack containers
- Staging: AWS account with test data
- Production: Synthetic monitoring with CloudWatch Synthetics
