# AI Portal Chatbot (RAG)

An AI-powered portal chatbot using **Retrieval-Augmented Generation (RAG)** to provide accurate, document-grounded answers from official portal documents. Built with an AWS-native architecture using **S3, Textract, OpenSearch, Lambda, API Gateway, DynamoDB, CloudWatch, and Amazon Bedrock**.

---

## 🚀 Problem Statement

Large government/enterprise portals contain thousands of PDFs, circulars, FAQs, and notices. Users struggle to find relevant answers quickly, resulting in:

- Poor user experience
- Increased support workload
- Slow information access

---

## 💡 Solution Overview

This project proposes a **RAG-based AI chatbot** that:

1. Retrieves relevant information from portal documents
2. Uses an LLM to generate a final answer
3. Provides **citations/source references** for transparency

---

## 🎯 Key Features

- Document ingestion from portal uploads
- PDF text extraction
- Chunking and embedding generation
- Semantic search using vector database
- AI answer generation using LLM
- Source citation support
- Scalable serverless architecture

---

## 🏗️ System Architecture (High Level)

**Document Pipeline**
- Upload → S3
- Text Extraction → Textract
- Chunk + Embedding → Lambda
- Store embeddings → OpenSearch

**Query Pipeline**
- User Query → API Gateway
- Retrieval → OpenSearch Vector Search
- Answer Generation → Amazon Bedrock
- Output → Response with citations

---

## ☁️ AWS Services Used

| AWS Service | Purpose |
|------------|---------|
| Amazon S3 | Store portal documents |
| Amazon Textract | Extract text from PDFs |
| Amazon OpenSearch | Store embeddings + vector search |
| AWS Lambda | Processing, chunking, retrieval logic |
| API Gateway | Expose chatbot API endpoints |
| Amazon Bedrock | LLM-based response generation |
| DynamoDB | Store metadata and query logs |
| CloudWatch | Monitoring and logging |

---

## 🔐 Security Considerations

- IAM-based access control
- Encrypted storage in S3 and DynamoDB
- API Gateway authentication support
- Logging and monitoring via CloudWatch

---

## 📌 Use Cases

- Government portal help assistant
- University admission portal chatbot
- Student service portal chatbot
- Enterprise internal knowledge assistant

---

## 📊 Expected Impact

- Faster user query resolution
- Reduced support workload
- Improved accessibility to public information
- Higher accuracy compared to keyword-based search

---

## 📈 Future Enhancements

- Multilingual support (Tamil, Hindi, etc.)
- Voice-based interaction
- Admin dashboard for document management
- Feedback-based improvement loop

---

## 📂 Repository Contents

- `requirements.md` → Project requirements and objectives
- `design.md` → System architecture and AWS design
- `README.md` → Project overview (this file)

---

## 👥 Team

(Add your team member names here)

---

## 📜 License

This project is submitted for hackathon evaluation and educational purposes.
