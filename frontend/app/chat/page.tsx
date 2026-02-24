'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Home, MessageSquare, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Toast, ToastType } from '@/components/Toast';
import { chatService } from '@/services/api';

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
        message: error.message || 'Failed to get response',
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

  const suggestedQuestions = [
    'What are the admission requirements?',
    'How do I apply for a service?',
    'What documents do I need?',
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/">
            <Button variant="secondary" size="sm" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <div className="p-4">
          <Button
            onClick={handleNewChat}
            variant="primary"
            size="sm"
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Recent Chats
          </h3>
          {messages.length > 0 && (
            <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
              Current conversation ({messages.length} messages)
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-500">Ask questions about uploaded documents</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-500 mb-6">
                Ask me anything about the uploaded documents
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Try asking:</p>
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="block mx-auto text-sm text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200'
                } rounded-lg p-4 shadow-sm`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Sources:</span>
                      {message.confidence !== undefined && (
                        <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {Math.round(message.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          • {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                isLoading={isLoading}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {input.length}/500 characters
            </p>
          </form>
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
