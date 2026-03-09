import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare, FileText, Plus } from 'lucide-react';

interface ChatHistoryItem {
    id: string;
    title: string;
}

interface SidebarProps {
    history: ChatHistoryItem[];
    currentSessionId?: string;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    history,
    currentSessionId,
    onNewChat,
    onSelectChat,
}) => {
    return (
        <aside className="w-[260px] h-screen bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0 transition-width duration-300">
            {/* Top: Logo (Optional but typically included) */}
            <div className="h-16 px-6 flex items-center border-b border-[#E2E8F0]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0B3C5D] rounded-md flex items-center justify-center flex-shrink-0 transition-transform active:scale-90">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-bold text-[#1E293B]">AI Assistant</span>
                        <span className="text-[10px] text-[#64748B] tracking-wider uppercase font-medium">Internal</span>
                    </div>
                </Link>
            </div>

            {/* New Chat button */}
            <div className="p-4">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-2.5 bg-[#0B3C5D] text-white text-sm font-medium rounded-md hover:bg-[#093249] transition-all duration-200 shadow-sm active:transform active:scale-95 group focus:ring-2 focus:ring-[#0F766E]/50"
                >
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    New Chat
                </button>
            </div>

            {/* Below: Scrollable chat history */}
            <div className="flex-1 overflow-y-auto mt-2 px-3 pb-6">
                {history.length > 0 ? (
                    <>
                        <div className="px-3 mb-4 flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-widest">Recent Chats</span>
                            <div className="h-px bg-[#E2E8F0] flex-1" />
                        </div>
                        <div className="space-y-1.5 overflow-hidden">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectChat(item.id)}
                                    className={`flex items-start gap-3 p-3.5 rounded-md cursor-pointer group transition-all duration-200 border-radius-max-8 ${currentSessionId === item.id
                                            ? 'bg-white border-l-4 border-l-[#0B3C5D] shadow-sm ml-0.5'
                                            : 'hover:bg-[#F8FAFC] border-l-4 border-l-transparent text-[#64748B]'
                                        }`}
                                >
                                    <FileText className={`w-4 h-4 flex-shrink-0 transition-colors ${currentSessionId === item.id ? 'text-[#0B3C5D]' : 'text-[#94A3B8] group-hover:text-[#475569]'}`} />
                                    <span className={`text-xs font-medium truncate leading-relaxed ${currentSessionId === item.id ? 'text-[#1E293B]' : 'group-hover:text-[#1E293B]'}`}>
                                        {item.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="px-4 py-8 text-center bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                        <MessageSquare className="w-8 h-8 text-[#E2E8F0] mx-auto mb-3" />
                        <p className="text-xs text-[#94A3B8] font-medium leading-relaxed">No chat history available. Start your first session.</p>
                    </div>
                )}
            </div>

            {/* Footer / Bottom Actions */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center justify-between">
                    <Link href="/admin" className="text-[11px] font-semibold text-[#0B3C5D] hover:underline uppercase tracking-wider">
                        Admin Dashboard
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/20" title="System Online"></span>
                </div>
            </div>
        </aside>
    );
};
