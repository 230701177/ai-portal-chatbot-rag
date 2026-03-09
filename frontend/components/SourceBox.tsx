import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

interface SourceBoxProps {
    sources?: string[];
    confidence?: number;
}

export const SourceBox: React.FC<SourceBoxProps> = ({ sources, confidence }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-4 fade-in bg-[#FAFBFC] p-4 rounded-md">
            <div id="sources-header" className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-[#E8F0F5] rounded flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#0B3C5D]" />
                </div>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Verified Sources</span>
            </div>

            <div className="space-y-2 pl-1 overflow-hidden">
                {sources.map((source, index) => (
                    <div key={index} className="flex items-center gap-2.5 group transition-colors hover:bg-white rounded p-1">
                        <div className="w-1.5 h-1.5 bg-[#CBD5E1] rounded-full flex-shrink-0 group-hover:bg-[#0B3C5D] transition-colors" />
                        <span className="text-xs text-[#1E293B] truncate font-medium group-hover:underline cursor-pointer">{source}</span>
                    </div>
                ))}
            </div>

            {confidence !== undefined && (
                <div className="mt-5 pt-4 border-t border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest leading-none">Confidence Score</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#1E293B] leading-none">{Math.round(confidence * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-[#0F766E] transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${confidence * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
