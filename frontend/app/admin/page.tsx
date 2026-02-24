'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Upload, Trash2, RefreshCw, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Toast, ToastType } from '@/components/Toast';
import { documentService, Document } from '@/services/api';

interface ToastState {
  message: string;
  type: ToastType;
}

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await documentService.list();
      setDocuments(docs);
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to load documents',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setToast({
        message: 'Only PDF files are supported',
        type: 'error',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({
        message: 'File size must be less than 10MB',
        type: 'error',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const fileContent = base64.split(',')[1];

        try {
          const response = await documentService.ingest(file.name, fileContent);
          setToast({
            message: `Document indexed successfully! ${response.total_chunks} chunks created.`,
            type: 'success',
          });
          await loadDocuments();
        } catch (error: any) {
          setToast({
            message: error.message || 'Failed to upload document',
            type: 'error',
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setToast({
          message: 'Failed to read file',
          type: 'error',
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to process file',
        type: 'error',
      });
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (documentName: string) => {
    if (!confirm(`Are you sure you want to delete "${documentName}"?`)) {
      return;
    }

    try {
      await documentService.delete(documentName);
      setToast({
        message: 'Document deleted successfully',
        type: 'success',
      });
      await loadDocuments();
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to delete document',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-sm text-gray-500">Upload and manage knowledge base documents</p>
            </div>
            <Link href="/">
              <Button variant="secondary" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
              <p className="text-sm text-gray-500">Upload PDF files to add to the knowledge base</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PDF files only, max 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              isLoading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Select PDF File'}
            </Button>
          </div>
        </Card>

        {/* Documents List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
              <p className="text-sm text-gray-500">
                {documents.length} document{documents.length !== 1 ? 's' : ''} indexed
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadDocuments}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoading && documents.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Upload your first PDF to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {doc.chunks} chunks
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.indexed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'Indexed'
                          ? 'bg-green-100 text-green-700'
                          : doc.status === 'Processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {doc.status === 'Indexed' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {doc.status}
                    </span>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(doc.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
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
