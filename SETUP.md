# Setup Guide

Complete step-by-step guide to set up the AI Portal Chatbot locally and on AWS.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [AWS Services Configuration](#aws-services-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Verification](#verification)

---

## Local Development Setup

### 1. Install Prerequisites

```bash
# Install Node.js 18+ (if not installed)
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should be 18.x or higher
npm --version

# Install Serverless Framework globally
npm install -g serverless

# Install AWS CLI (if not installed)
# Download from: https://aws.amazon.com/cli/
aws --version
```

### 2. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter your credentials:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 3. Clone Repository

```bash
git clone https://github.com/230701177/ai-portal-chatbot-rag.git
cd ai-portal-chatbot-rag
```

---

## AWS Services Configuration

### 1. Amazon OpenSearch Setup

#### Create OpenSearch Domain

```bash
# Using AWS CLI
aws opensearch create-domain \
  --domain-name ai-portal-chatbot \
  --engine-version OpenSearch_2.11 \
  --cluster-config InstanceType=t3.small.search,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp3,VolumeSize=20 \
  --access-policies '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"AWS": "*"},
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:*:domain/ai-portal-chatbot/*"
    }]
  }'
```

#### Or use AWS Console:

1. Go to AWS Console → OpenSearch Service
2. Click "Create domain"
3. Configuration:
   - **Domain name:** `ai-portal-chatbot`
   - **Deployment type:** Development and testing
   - **Version:** OpenSearch 2.11
   - **Instance type:** t3.small.search
   - **Number of nodes:** 1
   - **EBS storage:** 20 GB
   - **Network:** Public access
   - **Access policy:** Allow open access (for dev)
4. Click "Create"
5. Wait 15-20 minutes for domain to be active

#### Get OpenSearch Endpoint

```bash
# Using AWS CLI
aws opensearch describe-domain \
  --domain-name ai-portal-chatbot \
  --query 'DomainStatus.Endpoint' \
  --output text
```

Save this endpoint URL - you'll need it later.

### 2. Amazon Bedrock Setup

#### Request Model Access

1. Go to AWS Console → Amazon Bedrock
2. Click "Model access" in left sidebar
3. Click "Request model access"
4. Select models:
   - ✅ Amazon Titan Embeddings G1 - Text
   - ✅ Anthropic Claude 3 Sonnet
5. Click "Request model access"
6. Wait for approval (usually instant)

#### Verify Access

```bash
# List available models
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query 'modelSummaries[?contains(modelId, `titan-embed`) || contains(modelId, `claude-3-sonnet`)].modelId'
```

### 3. IAM Permissions

Ensure your AWS user/role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "es:ESHttpPost",
        "es:ESHttpPut",
        "es:ESHttpGet",
        "es:ESHttpDelete"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:InvokeFunction",
        "lambda:GetFunction",
        "lambda:DeleteFunction"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "apigateway:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:PutRolePolicy",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Backend Deployment

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add your OpenSearch endpoint:

```bash
AWS_REGION=us-east-1
OPENSEARCH_ENDPOINT=https://your-opensearch-endpoint.us-east-1.es.amazonaws.com
EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
LLM_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

### 3. Deploy to AWS

```bash
# Deploy to development environment
serverless deploy --stage dev --verbose

# This will:
# - Create S3 bucket for documents
# - Deploy 4 Lambda functions
# - Create API Gateway endpoints
# - Set up IAM roles
```

### 4. Save API Gateway URL

After deployment, you'll see output like:

```
Service Information
service: ai-portal-chatbot
stage: dev
region: us-east-1
stack: ai-portal-chatbot-dev
api keys:
  None
endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/ingest
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/query
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/documents
  DELETE - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/documents/{documentId}
functions:
  ingestDocument: ai-portal-chatbot-dev-ingestDocument
  queryChat: ai-portal-chatbot-dev-queryChat
  listDocuments: ai-portal-chatbot-dev-listDocuments
  deleteDocument: ai-portal-chatbot-dev-deleteDocument
```

Copy the base URL: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev`

---

## Frontend Deployment

### Option A: Local Development

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Configure Environment

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

Add your API Gateway URL:

```bash
NEXT_PUBLIC_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

#### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Option B: Deploy to Vercel

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
cd frontend
vercel --prod
```

#### 4. Add Environment Variable

During deployment, Vercel will ask for environment variables:

```
? Set up environment variables? Yes
? What's the name of the variable? NEXT_PUBLIC_API_URL
? What's the value? https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

Or add via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_API_URL` with your API Gateway URL

---

## Verification

### 1. Test Backend Endpoints

#### Test Query Endpoint

```bash
curl -X POST https://your-api-url/dev/query \
  -H "Content-Type: application/json" \
  -d '{"question": "test question"}'
```

Expected response:
```json
{
  "answer": "Information not found in uploaded documents.",
  "sources": [],
  "confidence": 0
}
```

#### Test List Documents

```bash
curl https://your-api-url/dev/documents
```

Expected response:
```json
{
  "documents": []
}
```

### 2. Test Frontend

1. Open your application URL
2. Click "Admin Upload"
3. Upload a test PDF
4. Wait for "Document indexed successfully" message
5. Click "Start Chat"
6. Ask a question related to the uploaded document
7. Verify you receive an answer with sources

### 3. Check CloudWatch Logs

```bash
# View logs for query function
serverless logs -f queryChat --tail

# View logs for ingest function
serverless logs -f ingestDocument --tail
```

### 4. Verify OpenSearch Index

```bash
# Check if index exists
curl -X GET "https://your-opensearch-endpoint/portal_knowledge/_search?pretty" \
  -H "Content-Type: application/json" \
  -d '{"size": 1}'
```

---

## Troubleshooting

### Issue: OpenSearch Connection Timeout

**Solution:**
1. Check OpenSearch domain status in AWS Console
2. Verify endpoint URL is correct
3. Ensure access policy allows connections
4. Check if domain is in VPC (should be public for dev)

### Issue: Bedrock Access Denied

**Solution:**
1. Go to Bedrock console → Model access
2. Verify models are approved
3. Check IAM permissions include `bedrock:InvokeModel`
4. Verify correct region (us-east-1)

### Issue: Lambda Timeout

**Solution:**
1. Increase timeout in `serverless.yml`:
   ```yaml
   timeout: 300
   ```
2. Redeploy: `serverless deploy --stage dev`

### Issue: CORS Error in Frontend

**Solution:**
1. Update `serverless.yml` with correct origin:
   ```yaml
   cors:
     origin: 'https://your-vercel-app.vercel.app'
   ```
2. Redeploy backend

### Issue: PDF Upload Fails

**Solution:**
1. Check file size (max 10MB)
2. Verify file is valid PDF
3. Check Lambda logs for errors
4. Ensure S3 bucket was created

---

## Next Steps

1. ✅ Upload sample documents
2. ✅ Test chat functionality
3. ✅ Monitor CloudWatch logs
4. ✅ Set up CloudWatch alarms
5. ✅ Configure production environment
6. ✅ Add custom domain (optional)
7. ✅ Enable API Gateway caching (optional)

---

## Support

If you encounter issues:

1. Check CloudWatch logs
2. Verify all AWS services are active
3. Review environment variables
4. Consult [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps
5. Open an issue on GitHub

---

**Setup complete! 🎉**
