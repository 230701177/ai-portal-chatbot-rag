'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Save, CheckCircle } from 'lucide-react';
import { Toast, ToastType } from '@/components/Toast';

interface ToastState {
  message: string;
  type: ToastType;
}

export default function SettingsPage() {
  const [bedrockModel, setBedrockModel] = useState('anthropic.claude-v2');
  const [embeddingModel, setEmbeddingModel] = useState('amazon.titan-embed-text-v1');
  const [chunkSize, setChunkSize] = useState(700);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [topK, setTopK] = useState(5);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [enableConfidence, setEnableConfidence] = useState(true);
  const [enableCitations, setEnableCitations] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleSave = () => {
    // Mock save action
    setToast({
      message: 'Settings saved successfully',
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200">
        <div className="px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-800">AI Portal Assistant</div>
              <div className="text-xs text-slate-500">Admin Dashboard</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Documents
            </Link>
            <Link href="/admin/analytics" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Analytics
            </Link>
            <Link href="/admin/settings" className="text-sm font-medium text-blue-700 border-b-2 border-blue-700 pb-1">
              Settings
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-700">AD</span>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">Admin</div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Container */}
      <div className="px-8 py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link href="/admin" className="hover:text-slate-900">Admin</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Settings</span>
        </div>

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-900">System Settings</h1>
          <p className="text-slate-500 mt-2">Configure RAG system parameters and behavior</p>
        </div>

        <div className="max-w-4xl">
          {/* Model Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Model Configuration</h2>

            <div className="space-y-6">
              {/* Bedrock Model */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bedrock LLM Model
                </label>
                <select
                  value={bedrockModel}
                  onChange={(e) => setBedrockModel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="anthropic.claude-v2">Anthropic Claude v2</option>
                  <option value="anthropic.claude-v2:1">Anthropic Claude v2.1</option>
                  <option value="anthropic.claude-instant-v1">Anthropic Claude Instant v1</option>
                  <option value="amazon.titan-text-express-v1">Amazon Titan Text Express v1</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Select the foundation model for generating responses
                </p>
              </div>

              {/* Embedding Model */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Embedding Model
                </label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="amazon.titan-embed-text-v1">Amazon Titan Embeddings v1</option>
                  <option value="cohere.embed-english-v3">Cohere Embed English v3</option>
                  <option value="cohere.embed-multilingual-v3">Cohere Embed Multilingual v3</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Model used for generating vector embeddings
                </p>
              </div>
            </div>
          </div>

          {/* Chunking Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Document Chunking</h2>

            <div className="space-y-6">
              {/* Chunk Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Chunk Size (tokens)
                  </label>
                  <span className="text-sm font-semibold text-blue-700">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1500"
                  step="50"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>300</span>
                  <span>1500</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Number of tokens per document chunk
                </p>
              </div>

              {/* Chunk Overlap */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Chunk Overlap (tokens)
                  </label>
                  <span className="text-sm font-semibold text-blue-700">{chunkOverlap}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="25"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span>300</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Overlap between consecutive chunks for context preservation
                </p>
              </div>
            </div>
          </div>

          {/* Retrieval Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Retrieval Settings</h2>

            <div className="space-y-6">
              {/* Top K */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Top-K Results
                  </label>
                  <span className="text-sm font-semibold text-blue-700">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Number of most relevant chunks to retrieve
                </p>
              </div>

              {/* Confidence Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Confidence Threshold
                  </label>
                  <span className="text-sm font-semibold text-blue-700">
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Minimum confidence score for displaying results
                </p>
              </div>
            </div>
          </div>

          {/* Response Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Response Configuration</h2>

            <div className="space-y-4">
              {/* Enable Confidence Score */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-800">Enable Confidence Scores</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Display confidence percentage with each response
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableConfidence}
                    onChange={(e) => setEnableConfidence(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
                </label>
              </div>

              {/* Enable Citations */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-800">Enable Source Citations</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Show source documents and page references
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCitations}
                    onChange={(e) => setEnableCitations(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/admin">
              <button className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </Link>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
