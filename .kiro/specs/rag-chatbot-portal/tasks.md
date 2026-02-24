# Implementation Plan: RAG Chatbot for Government Portals

## Overview

This implementation plan breaks down the RAG chatbot system into discrete coding tasks. The system will be built using Python 3.11 with AWS Lambda, following a serverless architecture. The implementation follows an incremental approach, building the document pipeline first, then the query pipeline, and finally integrating all components with API endpoints.

## Tasks

- [ ] 1. Set up project structure and core infrastructure
  - Create Python project with virtual environment
  - Set up directory structure: `/src/handlers`, `/src/services`, `/src/models`, `/src/utils`, `/tests`
  - Create `requirements.txt` with dependencies: boto3, opensearch-py, hypothesis, pytest, tiktoken, nltk
  - Set up AWS CDK or Terraform infrastructure-as-code for S3, DynamoDB, OpenSearch, Lambda, API Gateway
  - Configure environment variables and AWS Systems Manager Parameter Store for configuration
  - _Requirements: 13.5_

- [ ] 2. Implement data models and DynamoDB schemas
  - [ ] 2.1 Create data models for Document Metadata, Query Log, Chunk, Citation, and API responses
    - Define Pydantic models with validation for all data structures
    - Include serialization/deserialization methods for DynamoDB
    - _Requirements: 1.4, 8.1_
  
  - [ ]* 2.2 Write property test for data model validation
    - **Property: Data model round-trip serialization**
    - **Validates: Requirements 1.4**
    - Generate random model instances, serialize to DynamoDB format, deserialize, and verify equivalence
  
  - [ ] 2.3 Create DynamoDB table schemas and initialization scripts
    - Define table schemas for `document-metadata` and `query-logs` with GSIs
    - Create initialization script to set up tables with proper indexes and TTL
    - _Requirements: 1.4, 8.1_

- [ ] 3. Implement Document Upload Handler
  - [ ] 3.1 Create S3 upload handler with file validation
    - Implement `upload_document()` function with PDF format validation
    - Generate unique document IDs using UUID
    - Upload files to S3 with proper key structure
    - Handle upload errors with appropriate error messages
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 3.2 Create DynamoDB metadata writer
    - Implement function to create metadata records with all required fields
    - Include error handling and CloudWatch logging
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 3.3 Write property test for document upload consistency
    - **Property 1: Document Upload and Storage Consistency**
    - **Validates: Requirements 1.1, 1.4**
    - Generate random PDF files, upload, verify S3 storage and DynamoDB metadata
  
  - [ ]* 3.4 Write property test for input validation
    - **Property 2: Input Validation Rejects Invalid Inputs**
    - **Validates: Requirements 1.2, 1.3**
    - Generate files with various extensions, verify only PDFs are accepted
  
  - [ ]* 3.5 Write unit tests for upload error handling
    - Test S3 upload failures, DynamoDB write failures
    - Verify error logging to CloudWatch
    - _Requirements: 1.5_

- [ ] 4. Checkpoint - Verify document upload functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Text Extraction Handler
  - [ ] 5.1 Create Textract integration service
    - Implement `extract_text()` function using boto3 Textract client
    - Use `detect_document_text` API for text extraction
    - Preserve page boundaries and text ordering
    - Store extracted text in S3 at `extracted/{document_id}/text.json`
    - _Requirements: 2.2, 2.3_
  
  - [ ] 5.2 Create S3 event trigger handler
    - Implement Lambda handler triggered by S3 upload events
    - Parse S3 event, extract document info, invoke text extraction
    - Update DynamoDB status to "extracted" on success
    - _Requirements: 2.1, 2.5_
  
  - [ ] 5.3 Implement retry logic with exponential backoff
    - Create reusable retry decorator with exponential backoff
    - Apply to Textract API calls (3 attempts, base delay 2s)
    - _Requirements: 10.2_
  
  - [ ] 5.4 Add error handling and status updates
    - Log errors to CloudWatch with structured format
    - Update DynamoDB status to "failed" on extraction failure
    - _Requirements: 2.4, 10.1_
  
  - [ ]* 5.5 Write property test for text extraction order preservation
    - **Property 4: Text Extraction Preserves Order**
    - **Validates: Requirements 2.3**
    - Create PDFs with known text sequences, extract, verify order is preserved
  
  - [ ]* 5.6 Write property test for pipeline status tracking
    - **Property 3: Pipeline Status Tracking**
    - **Validates: Requirements 2.5**
    - Process documents, verify status progresses correctly and never regresses
  
  - [ ]* 5.7 Write unit tests for extraction error handling
    - Test Textract failures, retry exhaustion, error logging
    - _Requirements: 2.4_

- [ ] 6. Implement Chunking and Embedding Handler
  - [ ] 6.1 Create text chunking service
    - Implement `chunk_text()` function with configurable size and overlap
    - Use tiktoken for tokenization (cl100k_base encoding)
    - Use NLTK sentence tokenizer to preserve semantic boundaries
    - Generate chunk metadata (chunk_index, character_offset)
    - _Requirements: 3.1, 3.2_
  
  - [ ] 6.2 Create embedding generation service
    - Implement `generate_embeddings()` function using Amazon Bedrock
    - Use Titan Embeddings model via boto3 bedrock-runtime client
    - Batch process up to 25 chunks per API call
    - Handle embedding generation errors with retry logic
    - _Requirements: 3.3_
  
  - [ ] 6.3 Create Lambda handler for chunking and embedding pipeline
    - Triggered after text extraction completes
    - Load extracted text from S3, chunk it, generate embeddings
    - Pass chunks with embeddings to Vector Store Manager
    - Update DynamoDB status to "indexed" on completion
    - _Requirements: 3.4, 3.5_
  
  - [ ]* 6.4 Write property test for chunking configuration
    - **Property 5: Chunking Respects Configuration**
    - **Validates: Requirements 3.1**
    - Generate random texts and configurations, verify chunk sizes and overlaps
  
  - [ ]* 6.5 Write property test for semantic boundary preservation
    - **Property 6: Chunking Preserves Semantic Boundaries**
    - **Validates: Requirements 3.2**
    - Create texts with clear boundaries, verify chunks respect them
  
  - [ ]* 6.6 Write property test for embedding dimension consistency
    - **Property 7: Embedding Dimension Consistency**
    - **Validates: Requirements 3.3**
    - Generate random chunks, verify all embeddings have dimension 1536
  
  - [ ]* 6.7 Write unit tests for chunking edge cases
    - Test empty text, single-word text, very long text
    - Test embedding generation failures and retries
    - _Requirements: 3.1, 3.3_

- [ ] 7. Implement Vector Store Manager
  - [ ] 7.1 Create OpenSearch client and index initialization
    - Implement OpenSearch connection using opensearch-py
    - Create index with k-NN configuration (HNSW, cosine similarity, dimension 1536)
    - Define mapping for embedding, text, document_id, and metadata fields
    - _Requirements: 4.1_
  
  - [ ] 7.2 Implement chunk indexing function
    - Create `index_chunks()` function with bulk indexing (batch size 100)
    - Include retry logic with exponential backoff (3 attempts)
    - Store chunks with embeddings and complete metadata
    - _Requirements: 4.2, 4.4_
  
  - [ ] 7.3 Implement vector search function
    - Create `search_similar()` function using k-NN search
    - Return top-k chunks ranked by cosine similarity
    - Filter by similarity threshold
    - Include source metadata in results
    - _Requirements: 4.3_
  
  - [ ] 7.4 Add error handling for indexing failures
    - Log indexing errors to CloudWatch
    - Update DynamoDB status to "indexing_failed" after retry exhaustion
    - _Requirements: 4.5_
  
  - [ ]* 7.5 Write property test for data persistence with metadata
    - **Property 8: Data Persistence with Complete Metadata**
    - **Validates: Requirements 3.4, 4.2**
    - Index random chunks, retrieve them, verify all metadata fields are present
  
  - [ ]* 7.6 Write property test for vector search ranking
    - **Property 9: Vector Search Returns Top-K by Similarity**
    - **Validates: Requirements 4.3**
    - Index chunks, search with query embedding, verify results are ranked by similarity
  
  - [ ]* 7.7 Write property test for retry logic
    - **Property 10: Retry Logic with Exponential Backoff**
    - **Validates: Requirements 4.4, 10.2**
    - Simulate service failures, verify retry attempts with correct backoff delays
  
  - [ ]* 7.8 Write unit tests for OpenSearch integration
    - Test index creation, bulk indexing, search queries
    - Test error conditions and retry exhaustion
    - _Requirements: 4.1, 4.4, 4.5_

- [ ] 8. Checkpoint - Verify document pipeline end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Query Handler
  - [ ] 9.1 Create query validation service
    - Implement `validate_query()` function checking non-empty and max 500 characters
    - Return validation errors with descriptive messages
    - _Requirements: 5.1, 5.5_
  
  - [ ] 9.2 Create query embedding service
    - Implement `generate_query_embedding()` using same Bedrock model as documents
    - Ensure embedding dimension consistency (1536)
    - _Requirements: 5.2_
  
  - [ ] 9.3 Create retrieval orchestration service
    - Implement `retrieve_context()` function that generates query embedding and searches OpenSearch
    - Return top-k chunks with similarity scores and metadata
    - Handle no-results case (all scores below threshold)
    - _Requirements: 5.3, 5.4_
  
  - [ ] 9.4 Create main query processing handler
    - Implement `process_query()` Lambda handler
    - Orchestrate: validate → embed → retrieve → generate → respond
    - Handle errors gracefully with user-friendly messages
    - _Requirements: 5.1, 5.5_
  
  - [ ]* 9.5 Write property test for query validation
    - **Property 2: Input Validation Rejects Invalid Inputs** (query portion)
    - **Validates: Requirements 5.1, 5.5**
    - Generate queries of various lengths, verify validation logic
  
  - [ ]* 9.6 Write property test for embedding consistency
    - **Property 7: Embedding Dimension Consistency** (query portion)
    - **Validates: Requirements 5.2**
    - Generate random queries, verify embeddings have correct dimensions
  
  - [ ]* 9.7 Write property test for retrieval completeness
    - **Property 8: Data Persistence with Complete Metadata** (retrieval portion)
    - **Validates: Requirements 5.4**
    - Retrieve chunks, verify all required fields are present
  
  - [ ]* 9.8 Write unit tests for query edge cases
    - Test empty queries, very long queries, special characters
    - Test no-results scenario
    - _Requirements: 5.5_

- [ ] 10. Implement Answer Generator
  - [ ] 10.1 Create prompt construction service
    - Implement `construct_prompt()` function combining query and context chunks
    - Use template that instructs LLM to base answer only on provided context
    - _Requirements: 6.1, 6.3_
  
  - [ ] 10.2 Create Bedrock LLM integration service
    - Implement `generate_answer()` function using Amazon Bedrock
    - Use Claude 3 Sonnet model with boto3 bedrock-runtime client
    - Configure parameters: temperature=0.3, max_tokens=500, top_p=0.9
    - Implement timeout (30 seconds) and retry logic (3 attempts)
    - _Requirements: 6.2, 6.4_
  
  - [ ] 10.3 Handle no-results case
    - Return appropriate message when no relevant chunks found
    - _Requirements: 6.5_
  
  - [ ]* 10.4 Write property test for prompt construction
    - **Property 12: Prompt Construction Includes Query and Context**
    - **Validates: Requirements 6.1, 6.3**
    - Generate random queries and chunks, verify prompt includes both
  
  - [ ]* 10.5 Write property test for answer generation
    - **Property 13: Answer Generation Returns Response**
    - **Validates: Requirements 6.4**
    - Generate random prompts, verify non-empty responses or error messages
  
  - [ ]* 10.6 Write unit tests for answer generation
    - Test LLM invocation with mock Bedrock client
    - Test timeout and retry scenarios
    - Test no-results edge case
    - _Requirements: 6.2, 6.4, 6.5_

- [ ] 11. Implement Citation Builder
  - [ ] 11.1 Create citation extraction service
    - Implement `build_citations()` function extracting source info from chunks
    - Retrieve document metadata from DynamoDB (filename, upload date)
    - Format citations with document_id, filename, page_number, relevance_score
    - _Requirements: 7.1, 7.2_
  
  - [ ] 11.2 Implement citation consolidation logic
    - Consolidate multiple chunks from same document into single citation
    - Sort citations by relevance score
    - _Requirements: 7.4_
  
  - [ ] 11.3 Add citation links/references
    - Include S3 presigned URLs or document references for accessing originals
    - _Requirements: 7.3_
  
  - [ ]* 11.4 Write property test for citation completeness
    - **Property 14: Citation Completeness and Format**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    - Generate answers from chunks, verify citations include all required fields and are consolidated
  
  - [ ]* 11.5 Write unit tests for citation building
    - Test single-document citations, multi-document citations
    - Test citation consolidation logic
    - _Requirements: 7.4_

- [ ] 12. Implement Query Logger
  - [ ] 12.1 Create query logging service
    - Implement `log_query()` function writing to DynamoDB query-logs table
    - Include all required fields: query_text, timestamp, user_id, response_time, metrics
    - Implement asynchronous logging (non-blocking)
    - Set TTL for 90-day retention
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 12.2 Add error logging to CloudWatch
    - Log query failures with error type and message
    - Use structured logging format (JSON)
    - _Requirements: 8.4_
  
  - [ ]* 12.3 Write property test for query logging completeness
    - **Property 15: Query Logging Completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Process random queries, verify all required fields are logged
  
  - [ ]* 12.4 Write unit tests for logging
    - Test successful query logging, error logging
    - Test asynchronous logging behavior
    - _Requirements: 8.1, 8.4_

- [ ] 13. Checkpoint - Verify query pipeline end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement API Gateway endpoints
  - [ ] 14.1 Create API Gateway REST API definition
    - Define three endpoints: POST /query, POST /documents/upload, GET /documents/{id}/status
    - Configure CORS, request validation, and throttling
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 14.2 Implement authentication and authorization
    - Add API Gateway authorizer (Lambda or Cognito)
    - Validate authentication tokens on all requests
    - Return 401 for invalid/missing tokens
    - _Requirements: 9.4_
  
  - [ ] 14.3 Create API request/response handlers
    - Implement Lambda handlers for each endpoint
    - Parse and validate request bodies
    - Format responses according to API specifications
    - Return appropriate HTTP status codes (400, 401, 500)
    - _Requirements: 9.5_
  
  - [ ]* 14.4 Write property test for authentication validation
    - **Property 16: API Authentication Validation**
    - **Validates: Requirements 9.4**
    - Send requests with various tokens, verify validation logic
  
  - [ ]* 14.5 Write property test for error status codes
    - **Property 17: Error Response Status Codes**
    - **Validates: Requirements 9.5**
    - Trigger various errors, verify correct HTTP status codes
  
  - [ ]* 14.6 Write unit tests for API endpoints
    - Test request parsing, response formatting
    - Test authentication failures, validation errors
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Implement error handling and resilience
  - [ ] 15.1 Create centralized error handling middleware
    - Implement error handler that catches all exceptions
    - Log errors to CloudWatch with structured format
    - Return user-friendly error messages without internal details
    - _Requirements: 10.1, 10.3_
  
  - [ ] 15.2 Implement circuit breaker for external services
    - Create circuit breaker for Bedrock and OpenSearch calls
    - Configure: 5 failures threshold, 30s timeout, 60s half-open retry
    - _Requirements: 10.2_
  
  - [ ] 15.3 Add fault isolation for document processing
    - Ensure document processing failures don't affect other documents
    - Use separate Lambda invocations per document
    - _Requirements: 10.4_
  
  - [ ]* 15.4 Write property test for error logging
    - **Property 11: Error Handling Maintains System Stability**
    - **Validates: Requirements 1.5, 2.4, 4.5, 10.1, 10.4**
    - Trigger various errors, verify logging and system stability
  
  - [ ]* 15.5 Write property test for error message safety
    - **Property 18: Error Messages Hide Internal Details**
    - **Validates: Requirements 10.3**
    - Exhaust retries, verify error messages don't expose internals
  
  - [ ]* 15.6 Write unit tests for error handling
    - Test circuit breaker behavior, fault isolation
    - Test error message sanitization
    - _Requirements: 10.2, 10.3, 10.4_

- [ ] 16. Implement monitoring and observability
  - [ ] 16.1 Create CloudWatch metrics emitter
    - Implement function to emit custom metrics to CloudWatch
    - Emit metrics for: document throughput, query latency, error rates, token usage
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 16.2 Create CloudWatch alarms for critical errors
    - Define alarms for: high error rates, service unavailability, authentication failures
    - Configure SNS notifications for operator alerts
    - _Requirements: 11.5_
  
  - [ ] 16.3 Add structured logging throughout application
    - Use Python logging with JSON formatter
    - Include context: request_id, user_id, document_id in all logs
    - _Requirements: 10.1_
  
  - [ ]* 16.4 Write property test for metrics emission
    - **Property 19: Metrics Emission for Observability**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
    - Process documents and queries, verify metrics are emitted
  
  - [ ]* 16.5 Write property test for alarm triggering
    - **Property 20: Critical Error Alarm Triggering**
    - **Validates: Requirements 11.5**
    - Trigger critical errors, verify alarms are raised
  
  - [ ]* 16.6 Write unit tests for monitoring
    - Test metrics emission, alarm configuration
    - Test structured logging format
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 17. Implement configuration management
  - [ ] 17.1 Create configuration service
    - Implement service to load configuration from AWS Systems Manager Parameter Store
    - Support parameters: chunk_size, chunk_overlap, top_k, similarity_threshold, llm_model, temperature, max_tokens
    - Cache configuration with TTL (5 minutes)
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ] 17.2 Add dynamic configuration reloading
    - Implement configuration refresh without Lambda redeployment
    - Use Parameter Store versioning for configuration updates
    - _Requirements: 13.4_
  
  - [ ] 17.3 Create configuration initialization script
    - Script to set up initial configuration parameters in Parameter Store
    - Include default values for all configurable parameters
    - _Requirements: 13.5_
  
  - [ ]* 17.4 Write property test for configuration application
    - **Property 22: Configuration Application Without Redeployment**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
    - Change configurations, verify they are applied to subsequent requests
  
  - [ ]* 17.5 Write unit tests for configuration management
    - Test configuration loading, caching, refresh
    - Test default values and parameter validation
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 18. Implement asynchronous processing
  - [ ] 18.1 Configure Lambda concurrency and async invocation
    - Set up Lambda reserved concurrency for document processing
    - Configure async invocation with DLQ for failed events
    - _Requirements: 12.2_
  
  - [ ] 18.2 Add SQS queue for document processing
    - Create SQS queue for document processing events
    - Configure Lambda to process from queue with batch size 10
    - _Requirements: 12.2_
  
  - [ ]* 18.3 Write property test for asynchronous processing
    - **Property 21: Asynchronous Document Processing**
    - **Validates: Requirements 12.2**
    - Upload multiple documents, verify independent processing
  
  - [ ]* 18.4 Write unit tests for async processing
    - Test SQS message handling, DLQ behavior
    - Test concurrent processing
    - _Requirements: 12.2_

- [ ] 19. Integration and end-to-end wiring
  - [ ] 19.1 Wire document pipeline components
    - Connect: Upload Handler → S3 Event → Text Extractor → Chunker → Vector Store
    - Configure EventBridge rules and Lambda triggers
    - Test complete document pipeline with sample PDFs
    - _Requirements: 1.1, 2.1, 3.4_
  
  - [ ] 19.2 Wire query pipeline components
    - Connect: API Gateway → Query Handler → Retriever → Answer Generator → Citation Builder → Logger
    - Test complete query pipeline with sample queries
    - _Requirements: 5.1, 6.1, 7.1, 8.1_
  
  - [ ] 19.3 Create deployment scripts
    - Create infrastructure deployment script (CDK/Terraform)
    - Create application deployment script (Lambda functions, layers)
    - Create initialization script (DynamoDB tables, OpenSearch index, configuration)
    - _Requirements: All_
  
  - [ ]* 19.4 Write integration tests for complete workflows
    - Test: Upload document → Extract → Chunk → Index → Query → Answer with citations
    - Test: Multiple documents → Query spanning multiple sources
    - Test: Error scenarios with recovery
    - _Requirements: All_

- [ ] 20. Final checkpoint - End-to-end system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests verify end-to-end workflows with all components wired together
- The implementation uses Python 3.11 with AWS Lambda for serverless execution
- External AWS services (Textract, Bedrock, OpenSearch) should be mocked in tests using moto or LocalStack
