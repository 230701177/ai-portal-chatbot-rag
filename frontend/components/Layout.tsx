import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    className = '',
    maxWidth = 'max-w-[1240px]',
}) => {
    return (
        <div className={`min-h-screen bg-[#F4F6F8] flex flex-col transition-colors duration-500`}>
            <main className={`flex-1 w-full mx-auto px-6 py-10 pt-[104px] ${maxWidth} ${className} fade-in shadow-inner shadow-black/5`}>
                {children}
            </main>

            {/* Footer is typically part of global layout, but we'll include it here for consistency if needed */}
            <footer className="h-14 bg-white border-t border-[#E2E8F0] px-8 flex items-center justify-between mt-auto shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#64748B] tracking-tighter uppercase transition-colors hover:text-[#0B3C5D]">Portals AI</span>
                    <span className="w-1 h-1 bg-[#E2E8F0] rounded-full"></span>
                    <span className="text-[10px] text-[#94A3B8] font-medium leading-none">© 2026 Team Immortals | Powered by AWS</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-[#64748B] uppercase tracking-widest leading-none">
                    <span className="cursor-pointer hover:text-[#0F766E] transition-colors">Privacy</span>
                    <span className="cursor-pointer hover:text-[#0F766E] transition-colors">Terms of Service</span>
                    <span className="cursor-pointer hover:text-[#0F766E] transition-colors">Support</span>
                </div>
            </footer>
        </div>
    );
};
