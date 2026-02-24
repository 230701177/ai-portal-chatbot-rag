# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- AWS Account with appropriate permissions
- AWS CLI configured
- Serverless Framework installed globally: `npm install -g serverless`

## AWS Services Setup

### 1. Amazon OpenSearch Service

1. Go to AWS Console → OpenSearch Service
2. Create a new domain:
   - Domain name: `ai-portal-chatbot`
   - Instance type: `t3.small.search` (for dev) or `r6g.large.search` (for prod)
   - Number of nodes: 1 (for dev) or 3 (for prod)
   - EBS storage: 20GB
   - Network: Public access (for dev) or VPC (for prod)
   - Access policy: Allow all (for dev) or restrict by IP (for prod)
3. Wait for domain to be active (15-20 minutes)
4. Copy the endpoint URL

### 2. Amazon Bedrock

1. Go to AWS Console → Amazon Bedrock
2. Request model access:
   - Navigate to "Model access"
   - Request access to:
     - Amazon Titan Embeddings G1 - Text
     - Anthropic Claude 3 Sonnet
3. Wait for approval (usually instant)

### 3. IAM Permissions

Ensure your AWS user/role has these permissions:
- `bedrock:InvokeModel`
- `s3:*` (for document bucket)
- `es:*` (for OpenSearch)
- `lambda:*` (for Lambda functions)
- `apigateway:*` (for API Gateway)
- `logs:*` (for CloudWatch)

## Backend Deployment

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenSearch endpoint:

```
OPENSEARCH_ENDPOINT=https://your-opensearch-domain.region.es.amazonaws.com
AWS_REGION=us-east-1
```

### Step 3: Deploy to AWS

```bash
# Deploy to dev environment
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

This will:
- Create S3 bucket for documents
- Deploy Lambda functions
- Create API Gateway endpoints
- Set up IAM roles and permissions

### Step 4: Note API Gateway URL

After deployment, you'll see output like:

```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/ingest
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/query
  GET - https://abc123.execute-api.us-east-1.amazonaws.com/dev/documents
  DELETE - https://abc123.execute-api.us-east-1.amazonaws.com/dev/documents/{documentId}
```

Copy the base URL (everything before `/ingest`).

## Frontend Deployment

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API Gateway URL:

```
NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/dev
```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your API Gateway URL
4. Deploy

### Step 4: Configure CORS

Update `backend/serverless.yml` to allow your Vercel domain:

```yaml
functions:
  ingestDocument:
    events:
      - http:
          cors:
            origin: 'https://your-app.vercel.app'
```

Redeploy backend:

```bash
cd backend
serverless deploy --stage prod
```

## Verification

### Test Backend

```bash
# Test query endpoint
curl -X POST https://your-api-url/dev/query \
  -H "Content-Type: application/json" \
  -d '{"question": "test"}'
```

### Test Frontend

1. Open your Vercel URL
2. Go to Admin page
3. Upload a test PDF
4. Go to Chat page
5. Ask a question

## Monitoring

### CloudWatch Logs

```bash
# View logs for specific function
serverless logs -f queryChat --tail

# View logs for all functions
serverless logs --tail
```

### OpenSearch Dashboard

1. Go to OpenSearch domain in AWS Console
2. Click on "OpenSearch Dashboards URL"
3. Navigate to Dev Tools
4. Check index:

```json
GET /portal_knowledge/_search
{
  "size": 10
}
```

## Troubleshooting

### Lambda Timeout

If ingestion fails for large PDFs:

```yaml
# In serverless.yml
functions:
  ingestDocument:
    timeout: 300  # Increase to 5 minutes
```

### OpenSearch Connection Issues

1. Check security group allows Lambda access
2. Verify OpenSearch domain is active
3. Test endpoint connectivity

### Bedrock Access Denied

1. Verify model access is approved
2. Check IAM role has `bedrock:InvokeModel` permission
3. Confirm correct model IDs in config

## Cost Optimization

### Development

- Use `t3.small.search` for OpenSearch
- Set Lambda memory to 1024MB
- Use on-demand billing

### Production

- Use `r6g.large.search` for OpenSearch
- Enable OpenSearch reserved instances
- Set up CloudWatch alarms for cost monitoring
- Implement API Gateway caching

## Cleanup

To remove all resources:

```bash
cd backend
serverless remove --stage dev
```

Manually delete:
- OpenSearch domain
- S3 bucket contents
- CloudWatch log groups (if desired)
