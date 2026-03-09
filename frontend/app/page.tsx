'use client';

import Link from 'next/link';
import { FileText, Zap, CheckCircle, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { Layout } from '@/components/Layout';

export default function Home() {
  return (
    <>
      <Header />
      <Layout>
        {/* Hero Section */}
        <section className="pb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold text-primary leading-tight">
                AI-Powered Knowledge Assistant
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                Get accurate answers directly from official documents. Powered by semantic search and verified citations from your enterprise knowledge base.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link href="/chat">
                  <button
                    id="hero-start-chat-btn"
                    className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition-all shadow-md active:scale-95"
                  >
                    Start Chat
                  </button>
                </Link>
                <Link href="/admin">
                  <button
                    id="hero-upload-btn"
                    className="px-6 py-2.5 border border-primary text-primary text-sm font-semibold rounded-md hover:bg-primary/5 transition-all active:scale-95"
                  >
                    Upload Documents
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column — Card */}
            <div className="bg-white border border-border rounded-lg shadow-card p-8 hover:shadow-card-hover transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-medium text-slate-800 mb-3">Document-Grounded AI</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every answer is sourced directly from your uploaded PDF documents. No hallucinations — only verified, cited information from your official knowledge base.
              </p>
              <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Verified Citations
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Lock className="w-4 h-4 text-secondary" />
                  Secure Storage
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Zap className="w-4 h-4 text-secondary" />
                  Semantic Search
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  AWS Powered
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid md:grid-cols-3 gap-8 pb-12">
          {/* Card 1 */}
          <div className="bg-white border border-border rounded-lg shadow-card p-6 hover:shadow-card-hover transition-all animate-fade-in">
            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Semantic Search</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Vector embeddings retrieve contextually relevant information from your knowledge base with high precision.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-border rounded-lg shadow-card p-6 hover:shadow-card-hover transition-all animate-fade-in">
            <div className="w-10 h-10 bg-secondary/10 rounded-md flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Verified Citations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every response includes source documents and confidence scores so you can trace every answer.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-border rounded-lg shadow-card p-6 hover:shadow-card-hover transition-all animate-fade-in">
            <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Secure & Scalable</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enterprise-grade security on AWS infrastructure with end-to-end encryption and unlimited scalability.
            </p>
          </div>
        </section>
      </Layout>
    </>
  );
}
