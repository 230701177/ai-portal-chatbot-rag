# AI Portal Assistant - RAG-Based Knowledge Platform

An enterprise-grade AI-powered knowledge assistant using **Retrieval-Augmented Generation (RAG)** to provide accurate, document-grounded answers with verified citations. Built with AWS serverless architecture.

## 🌐 Live Demo

**GitHub Pages**: https://230701177.github.io/ai-portal-chatbot-rag/

Try it now! No installation required. The demo runs entirely in your browser with mock backend.

## 🚀 Quick Start

### Option 1: Mock Backend (5 Minutes - No AWS Required)

Perfect for local development, demos, and UI testing.

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local and set: NEXT_PUBLIC_USE_MOCK=true
npm run dev
```

**Default credentials**: `admin@aiportal.com` / `admin123`

Open http://localhost:3000

### Option 2: Full AWS Deployment

See deployment documentation for production setup with real AI capabilities.

## 🎯 Features

### Core Capabilities
- ✅ Document ingestion and indexing
- ✅ PDF text extraction and chunking
- ✅ Vector embeddings (Amazon Titan)
- ✅ Semantic search (OpenSearch Vector)
- ✅ AI answer generation (Amazon Bedrock Claude)
- ✅ Source citation with chunk references
- ✅ Confidence scoring
- ✅ View and download full PDF content
- ✅ Scalable serverless architecture

### User Interface
- ✅ Professional government portal design
- ✅ Landing page with product overview
- ✅ Chat interface with conversation history
- ✅ Admin document management
- ✅ Analytics dashboard
- ✅ Settings configuration
- ✅ Interactive source citations
- ✅ Document viewer modal
- ✅ Loading states and error handling

### Development Features
- ✅ Mock backend for local development
- ✅ Environment-based configuration
- ✅ TypeScript throughout
- ✅ Modular architecture
- ✅ Comprehensive error handling

## 🏗️ System Architecture

### Document Pipeline
```
Upload → S3 → Text Extraction → Chunking → 
Embedding (Titan) → OpenSearch Vector Index
```

### Query Pipeline
```
User Query → API Gateway → Lambda → 
Vector Search (OpenSearch) → Context Retrieval → 
LLM Generation (Bedrock Claude) → Response + Citations
```

## 🛠️ Technology Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons

**Backend**
- AWS Lambda (Node.js)
- API Gateway
- Amazon Bedrock (Claude + Titan)
- Amazon OpenSearch (Vector Search)
- Amazon S3 (Document Storage)
- DynamoDB (Metadata)
- CloudWatch (Monitoring)

## 📁 Project Structure

```
ai-portal-assistant/
├── frontend/                 # Next.js application
│   ├── app/                 # Pages (landing, chat, admin)
│   ├── components/          # Reusable UI components
│   ├── services/            # API and mock services
│   └── .env.local.example   # Environment configuration
├── backend/                 # AWS Lambda functions
│   ├── lambdas/            # Handler functions
│   ├── services/           # Business logic
│   └── serverless.yml      # Infrastructure as code
└── .kiro/                  # Kiro specs and configuration
```

## 🎨 Design System

- **Color Palette**: Deep Navy (#0B3C5D), Teal (#0F766E), Muted Gold (#C4A000)
- **Typography**: Inter font family
- **Spacing**: 16px grid system
- **Border Radius**: 8px maximum
- **Style**: Professional government portal aesthetic

## 🔧 Configuration

### Mock Mode (Development)
```env
# .env.local
NEXT_PUBLIC_USE_MOCK=true
```

### Real Mode (Production)
```env
# .env.local
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://your-api-gateway.amazonaws.com/dev
```

## 📚 Sample Documents

The mock backend includes 3 pre-loaded documents:

1. **Q3_Financial_Report.pdf** - Financial analysis and metrics
2. **Admission_Policy_2026.pdf** - Complete admission guidelines
3. **Technical_Manual_v2.pdf** - System configuration guide

## 💬 Sample Queries

**Will find relevant documents:**
- "What are the admission requirements?"
- "Tell me about Q3 financial performance"
- "How do I configure the system?"

**Will show no documents found:**
- "What's the weather today?"
- "Tell me a joke"

## 🎯 Key Features Explained

### Interactive Source Citations
- Hover over any source citation to see View and Download buttons
- Click the eye icon to view full document content in a modal
- Click the download icon to download content as a text file

### Mock AI Intelligence
- Keyword-based document matching
- Contextual response generation
- Source citation with confidence scores
- Fallback messages for unmatched queries

### Document Management
- Upload PDFs (simulated in mock mode)
- View document list with metadata
- Delete documents
- Search functionality
- Status tracking

## 🔐 Security Features

- IAM-based access control
- Encrypted storage (S3, DynamoDB)
- API Gateway authentication
- CloudWatch monitoring and logging
- Role-based permissions

## 📊 Use Cases

1. **Government Portals** - Citizen query assistance
2. **University Portals** - Admission and student services
3. **Enterprise Knowledge Base** - Internal documentation
4. **Public Service Portals** - FAQ and policy information

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- AWS Account (for production)
- AWS CLI configured (for production)

### Local Development
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Configure environment
cp frontend/.env.local.example frontend/.env.local
# Set NEXT_PUBLIC_USE_MOCK=true

# Start development server
cd frontend && npm run dev
```

### Production Deployment
```bash
# Deploy backend
cd backend
serverless deploy --stage prod

# Build and deploy frontend
cd ../frontend
npm run build
# Deploy to your hosting service
```

## 🧪 Testing

### Test Chat Functionality
1. Go to `/chat`
2. Ask: "What are the admission requirements?"
3. View AI response with sources
4. Click eye icon on source to view full document
5. Click download icon to download content

### Test Document Management
1. Go to `/admin`
2. Upload a PDF file
3. View document in list
4. Search for documents
5. Delete a document

## 📈 Performance

- **Response Time**: 1.5-2 seconds (mock mode)
- **Confidence Scores**: 85-100% for matched documents
- **Data Persistence**: localStorage (mock mode)
- **Scalability**: Auto-scaling (production mode)

## 🤝 Contributing

This project was built for the AI for Bharat Hackathon 2026.

## 👥 Team Immortal

- **Satyaraj N** - Full Stack Developer & System Architect
- **Manoharan K** - Frontend Developer & UI/UX Designer

## 🏆 Hackathon Information

- **Event**: AI for Bharat Hackathon
- **Submission Deadline**: March 4th, 2026
- **AWS Credits**: $100 (Code: PC10F11VCZNS2GU)
- **Category**: AI-Powered Public Service Solutions

## 📝 License

This project is submitted for hackathon evaluation and educational purposes.

## 🔗 Links

- **Live Demo**: https://230701177.github.io/ai-portal-chatbot-rag/
- **Repository**: https://github.com/230701177/ai-portal-chatbot-rag
- **Documentation**: See GITHUB_PAGES_SETUP.md for deployment guide

## 💡 Tips

- Use mock mode for development and demos
- Switch to real mode for production deployment
- Clear localStorage to reset mock data
- Check browser console for debugging

## 🐛 Troubleshooting

### Mock mode not working
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_USE_MOCK=true`
- Restart dev server

### Authentication errors
- Clear browser localStorage
- Refresh the page
- Check browser console for errors

### Port already in use
```bash
PORT=3001 npm run dev
```

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for better public service delivery**
