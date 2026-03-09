'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Upload,
  Trash2,
  RefreshCcw,
  FileText,
  Loader2,
  Search,
  UploadCloud,
} from 'lucide-react';
import { Toast, ToastType } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { documentService, Document } from '@/services/api';

interface ToastState {
  message: string;
  type: ToastType;
}

interface DeleteConfirmState {
  isOpen: boolean;
  documentName: string;
}

type StatusType = 'Indexed' | 'Processing' | 'Failed';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    Indexed: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
    Processing: { bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]', dot: 'bg-[#CA8A04]' },
    Failed: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
  };
  const s = map[status] ?? map['Failed'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    documentName: '',
  });
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
      setToast({ message: error.message || 'Failed to load documents', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setToast({ message: 'Only PDF files are supported', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'File size must be less than 10MB', type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async event => {
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
          setToast({ message: error.message || 'Failed to upload document', type: 'error' });
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setToast({ message: 'Failed to read file', type: 'error' });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to process file', type: 'error' });
      setIsUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDeleteClick = (documentName: string) => {
    setDeleteConfirm({ isOpen: true, documentName });
  };

  const handleDeleteConfirm = async () => {
    const { documentName } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, documentName: '' });
    try {
      await documentService.delete(documentName);
      setToast({ message: 'Document deleted successfully', type: 'success' });
      await loadDocuments();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete document', type: 'error' });
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0B3C5D] rounded-md flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1E293B] leading-none">AI Portal Assistant</div>
              <div className="text-xs text-[#64748B] leading-none mt-0.5">Admin</div>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-[#0B3C5D] border-b-2 border-[#0B3C5D] pb-0.5"
            >
              Documents
            </Link>
            <Link
              href="/chat"
              className="text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              Go to Chat
            </Link>
            <Link
              href="/"
              className="text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-[1200px] mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1E293B]">Document Management</h1>
          <p className="text-sm text-[#64748B] mt-1">Upload and manage your knowledge base documents</p>
        </div>

        {/* Upload Card */}
        <div
          id="upload-drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`bg-white border-2 border-dashed rounded-lg p-10 mb-8 text-center transition-colors ${isDragging
            ? 'border-[#0F766E] bg-[#E6F7F6]'
            : 'border-[#CBD5E1] hover:border-[#0B3C5D]'
            }`}
        >
          <div className="w-12 h-12 bg-[#E8F0F5] rounded-md flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-6 h-6 text-[#0B3C5D]" />
          </div>
          <p className="text-sm font-medium text-[#1E293B] mb-1">
            {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
          </p>
          <p className="text-xs text-[#64748B] mb-5">or click the button below to browse</p>
          <button
            id="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B3C5D] text-white text-sm font-medium rounded-md hover:bg-[#093249] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload PDF
              </>
            )}
          </button>
          <p className="text-xs text-[#94A3B8] mt-3">Supported format: PDF only · Max size: 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Document Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1E293B]">Uploaded Documents</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all w-56"
                />
              </div>
              <button
                id="refresh-btn"
                onClick={loadDocuments}
                disabled={isLoading}
                className="p-2 text-[#64748B] hover:text-[#1E293B] transition-colors rounded-md hover:bg-[#F4F6F8]"
                title="Refresh"
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table Body */}
          {isLoading && documents.length === 0 ? (
            <div className="py-16 text-center">
              <Loader2 className="w-7 h-7 text-[#94A3B8] animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-md flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-medium text-[#475569] mb-1">
                {searchQuery ? 'No documents found' : 'No documents uploaded yet'}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Upload your first PDF to get started'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left py-3 px-6 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Uploaded Date
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#0B3C5D] flex-shrink-0" />
                        <span className="font-medium text-[#1E293B]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#475569]">
                      {new Date(doc.indexed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={loadDocuments}
                          className="p-1.5 text-[#64748B] hover:text-[#0B3C5D] transition-colors rounded hover:bg-[#E8F0F5]"
                          title="Reindex document"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(doc.name)}
                          className="p-1.5 text-[#64748B] hover:text-[#DC2626] transition-colors rounded hover:bg-[#FEE2E2]"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteConfirm.documentName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, documentName: '' })}
      />
    </div>
  );
}
