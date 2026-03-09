'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  MessageSquare,
  PaperclipIcon,
  Send,
  Loader2,
  Plus,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { Toast, ToastType } from '@/components/Toast';
import { chatService } from '@/services/api';
import { getDocumentByName } from '@/services/mockDatabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  confidence?: number;
  timestamp: Date;
}

interface ToastState {
  message: string;
  type: ToastType;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface DocumentViewerState {
  isOpen: boolean;
  documentName: string;
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentName: '',
    content: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Create session if first message
    if (messages.length === 0) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.trim().slice(0, 40) + (input.trim().length > 40 ? '...' : ''),
        timestamp: new Date(),
      };
      setSessions(prev => [newSession, ...prev]);
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await chatService.query(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        confidence: response.confidence,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to get response. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleViewDocument = async (source: string) => {
    try {
      // Extract document name from source (format: "DocumentName.pdf - chunk X")
      const documentName = source.split(' - ')[0];
      const doc = await getDocumentByName(documentName);
      
      if (doc && doc.content) {
        setDocumentViewer({
          isOpen: true,
          documentName: doc.name,
          content: doc.content,
        });
      } else {
        setToast({
          message: 'Document content not available',
          type: 'error',
        });
      }
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to load document',
        type: 'error',
      });
    }
  };

  const handleDownloadDocument = async (source: string) => {
    try {
      // Extract document name from source
      const documentName = source.split(' - ')[0];
      const doc = await getDocumentByName(documentName);
      
      if (doc && doc.content) {
        // Create a blob with the content
        const blob = new Blob([doc.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName.replace('.pdf', '.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setToast({
          message: 'Document downloaded successfully',
          type: 'success',
        });
      } else {
        setToast({
          message: 'Document content not available',
          type: 'error',
        });
      }
    } catch (error: any) {
      setToast({
        message: error.message || 'Failed to download document',
        type: 'error',
      });
    }
  };

  const closeDocumentViewer = () => {
    setDocumentViewer({
      isOpen: false,
      documentName: '',
      content: '',
    });
  };

  return (
    <div className="h-screen flex bg-[#F4F6F8] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-[#E2E8F0]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0B3C5D] rounded-md flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1E293B] leading-none">AI Portal</div>
              <div className="text-xs text-[#64748B] leading-none mt-0.5">Assistant</div>
            </div>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            id="new-chat-btn"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B3C5D] text-white text-sm font-medium rounded-md hover:bg-[#093249] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {sessions.length > 0 && (
            <>
              <div className="px-2 mb-2">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Recent
                </span>
              </div>
              <div className="space-y-1">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-[#F4F6F8] transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-[#64748B] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1E293B] truncate">{session.title}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {sessions.length === 0 && (
            <div className="px-2 py-4">
              <p className="text-xs text-[#94A3B8]">No conversations yet. Start a new chat.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-[#1E293B]">Portal AI Assistant</h1>
            <span className="inline-flex items-center px-2.5 py-1 bg-[#E6F7F6] text-[#0F766E] text-xs font-medium rounded-md">
              Document Grounded
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Empty State */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 bg-[#E8F0F5] rounded-md flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-[#0B3C5D]" />
                </div>
                <h2 className="text-base font-semibold text-[#1E293B] mb-2">Start a Conversation</h2>
                <p className="text-sm text-[#64748B] max-w-xs">
                  Ask questions about your uploaded documents. The AI will provide verified, cited answers.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map(message => (
              <div
                key={message.id}
                className={`fade-in ${message.role === 'user' ? 'flex justify-end' : ''}`}
              >
                {message.role === 'user' ? (
                  /* User Message */
                  <div className="bg-[#F1F5F9] text-[#1E293B] px-4 py-3 rounded-md max-w-xl">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  /* AI Message */
                  <div className="bg-white border border-[#E2E8F0] rounded-md shadow-sm overflow-hidden mb-4">
                    {/* Response Body */}
                    <div className="p-5">
                      <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* Sources + Confidence */}
                    {(message.sources && message.sources.length > 0) ||
                      message.confidence !== undefined ? (
                      <div className="border-t border-[#E2E8F0] px-5 py-4 bg-[#F8FAFC] space-y-3">
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">
                              Sources
                            </p>
                            <div className="space-y-1.5">
                              {message.sources.map((source, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                  <FileText className="w-3.5 h-3.5 text-[#0B3C5D] flex-shrink-0" />
                                  <span className="text-xs text-[#475569] flex-1">{source}</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleViewDocument(source)}
                                      className="p-1 text-[#0B3C5D] hover:bg-[#E8F0F5] rounded transition-colors"
                                      title="View document"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadDocument(source)}
                                      className="p-1 text-[#0B3C5D] hover:bg-[#E8F0F5] rounded transition-colors"
                                      title="Download document"
                                    >
                                      <Download className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Confidence */}
                        {message.confidence !== undefined && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                                Confidence
                              </p>
                              <span className="text-xs font-semibold text-[#1E293B]">
                                {Math.round(message.confidence * 100)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0F766E] transition-all duration-500"
                                style={{ width: `${message.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white border border-[#E2E8F0] rounded-md shadow-sm p-5 max-w-3xl fade-in">
                <div className="flex items-center gap-3 text-[#64748B]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B3C5D]" />
                  <span className="text-sm">Searching documents...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-[#E2E8F0] px-8 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 border border-[#E2E8F0] rounded-md bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#0F766E] focus-within:border-[#0F766E] transition-all">
              {/* Attachment Icon */}
              <button
                type="button"
                id="attach-btn"
                className="flex-shrink-0 text-[#94A3B8] hover:text-[#64748B] transition-colors mb-0.5"
                title="Attach file"
              >
                <PaperclipIcon className="w-4 h-4" />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                id="chat-input"
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                className="flex-1 bg-transparent outline-none resize-none text-sm text-[#1E293B] placeholder-[#94A3B8] min-h-[24px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />

              {/* Send Button */}
              <button
                type="submit"
                id="send-btn"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-8 h-8 bg-[#0B3C5D] rounded-md flex items-center justify-center hover:bg-[#093249] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 text-center">
              Answers are grounded in uploaded documents only
            </p>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Document Viewer Modal */}
      {documentViewer.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0B3C5D]" />
                <h2 className="text-lg font-semibold text-[#1E293B]">{documentViewer.documentName}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDocument(documentViewer.documentName)}
                  className="p-2 text-[#64748B] hover:text-[#0B3C5D] hover:bg-[#F4F6F8] rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={closeDocumentViewer}
                  className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F4F6F8] rounded transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <pre className="text-sm text-[#1E293B] whitespace-pre-wrap font-sans leading-relaxed">
                {documentViewer.content}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B]">
                  This is the full content extracted from the PDF document
                </p>
                <button
                  onClick={closeDocumentViewer}
                  className="px-4 py-2 bg-[#0B3C5D] text-white text-sm font-medium rounded-md hover:bg-[#093249] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
