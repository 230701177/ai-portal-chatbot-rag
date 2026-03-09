import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, X } from 'lucide-react';

interface UploadCardProps {
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onUpload, isUploading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
            }
        }
    };

    const clearSelection = () => setSelectedFile(null);

    const triggerUpload = async () => {
        if (selectedFile) {
            await onUpload(selectedFile);
            setSelectedFile(null);
        }
    };

    return (
        <div
            className={`relative w-full overflow-hidden bg-white border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 transform-gpu ${dragActive
                    ? 'border-[#0F766E] bg-[#E6F7F6] scale-[1.01] shadow-lg'
                    : 'border-[#E2E8F0] hover:border-[#0B3C5D] hover:bg-[#F8FAFC]'
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center space-y-5">
                <div className={`w-14 h-14 rounded-md flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-[#0F766E]/10' : 'bg-[#E8F0F5]'}`}>
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-[#0B3C5D] animate-spin" />
                    ) : (
                        <UploadCloud className={`w-6 h-6 transition-colors ${dragActive ? 'text-[#0F766E]' : 'text-[#0B3C5D]'}`} />
                    )}
                </div>

                <div>
                    <h3 className="text-base font-semibold text-[#1E293B] mb-2">
                        {isUploading ? 'Uploading & Processing...' : 'Upload Official Documents'}
                    </h3>
                    <p className="text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
                        Drag and drop your PDF here, or click the button below to browse. Supports PDF files up to 10MB each.
                    </p>
                </div>

                {selectedFile && !isUploading ? (
                    <div className="flex items-center gap-3 bg-[#E8F0F5] px-4 py-2.5 rounded-md border border-[#D1E1EB] fade-in shadow-sm animate-bounce-subtle">
                        <FileText className="w-4 h-4 text-[#0B3C5D]" />
                        <span className="text-sm font-semibold text-[#1E293B] max-w-[240px] truncate">{selectedFile.name}</span>
                        <button
                            onClick={clearSelection}
                            className="p-1 hover:bg-[#D1E1EB] rounded-full transition-colors text-[#64748B]"
                            title="Remove Selection"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : null}

                <div className="pt-2">
                    <label className="relative">
                        <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleChange}
                            disabled={isUploading}
                        />
                        <button
                            id="btn-upload-trigger"
                            onClick={selectedFile ? triggerUpload : undefined}
                            className={`inline-flex items-center gap-2.5 px-6 py-3 bg-[#0B3C5D] text-white text-sm font-semibold rounded-md transition-all duration-200 active:scale-95 shadow-md ${isUploading || (!selectedFile && !dragActive) ? 'opacity-90 cursor-default pointer-events-none' : 'hover:bg-[#093249] hover:shadow-lg'
                                }`}
                        >
                            {isUploading ? (
                                <> <Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                            ) : selectedFile ? (
                                'Ingest Document'
                            ) : (
                                'Select PDF'
                            )}
                        </button>
                        {!selectedFile && !isUploading && (
                            <button
                                type="button"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
                            />
                        )}
                    </label>
                </div>

                <div className="pt-4 flex items-center gap-4 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest leading-none">
                    <span>PDF only</span>
                    <span className="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                    <span>Max 10MB</span>
                    <span className="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                    <span>Document-Grounded</span>
                </div>
            </div>
        </div>
    );
};
