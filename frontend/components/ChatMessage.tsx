import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    confidence?: number;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    role,
    content,
    sources,
    confidence,
}) => {
    const isUser = role === 'user';

    return (
        <div
            className={`mx-auto w-full max-w-4xl fade-in mb-4 ${isUser ? 'flex justify-end' : ''}`}
        >
            {isUser ? (
                /* User messages: Light gray background, right aligned, smaller width. */
                <div className="bg-[#F1F5F9] text-[#1E293B] px-4 py-3 rounded-md max-w-xl shadow-sm text-sm border border-[#E2E8F0] self-end">
                    <p className="whitespace-pre-wrap">{content}</p>
                </div>
            ) : (
                /* AI messages: White card, border, rounded-md. */
                <div className="bg-white border border-[#E2E8F0] rounded-md shadow-sm overflow-hidden w-full max-w-3xl">
                    <div className="p-5">
                        <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                            {content}
                        </p>
                    </div>

                    {(sources && sources.length > 0) || confidence !== undefined ? (
                        <div className="border-t border-[#E2E8F0] px-5 py-4 bg-[#F8FAFC] space-y-3">
                            {sources && sources.length > 0 && (
                                <div id="sources-section">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-[#0B3C5D]" />
                                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                                            Sources
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 ml-1">
                                        {sources.map((source, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="w-1 h-1 bg-[#94A3B8] rounded-full" />
                                                <span className="text-xs text-[#1E293B] font-medium">{source}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {confidence !== undefined && (
                                <div id="confidence-section">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                                            Confidence
                                        </span>
                                        <span className="text-xs font-bold text-[#1E293B]">
                                            {Math.round(confidence * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#0F766E] transition-all duration-500 ease-in-out"
                                            style={{ width: `${confidence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
