'use client';

import Link from 'next/link';
import { MessageSquare, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              AI Portal Chatbot
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intelligent document-grounded answers powered by Retrieval-Augmented Generation (RAG)
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Conversations</h3>
            <p className="text-gray-600 text-sm">
              Ask questions in natural language and get accurate, context-aware answers
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
            <p className="text-gray-600 text-sm">
              Upload PDF documents and let AI extract and index knowledge automatically
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Source Citations</h3>
            <p className="text-gray-600 text-sm">
              Every answer includes source references for transparency and verification
            </p>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/chat">
            <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Chat
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto min-w-[200px]">
              <Upload className="w-5 h-5 mr-2" />
              Admin Upload
            </Button>
          </Link>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-500 mb-4">Powered by</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="px-4 py-2 bg-white rounded-full shadow-sm">Amazon Bedrock</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm">OpenSearch</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm">AWS Lambda</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm">Next.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
