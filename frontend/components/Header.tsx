import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  showNav?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showNav = true }) => {
  return (
    <header className="h-[64px] bg-white border-b border-[#E2E8F0] fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-[1240px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Left Section: Logo & Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0B3C5D] rounded-md flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-semibold text-[#1E293B] tracking-tight">AI Portal Assistant</span>
        </Link>

        {/* Right Section: Navigation Buttons */}
        {showNav && (
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <button
                id="link-chat"
                className="px-5 py-2.5 bg-[#0B3C5D] text-white text-sm font-medium rounded-md hover:bg-[#093249] transition-all duration-200 active:transform active:scale-95 shadow-sm"
              >
                Chat
              </button>
            </Link>
            <Link href="/admin">
              <button
                id="link-admin"
                className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] text-sm font-medium rounded-md hover:bg-[#F4F6F8] transition-all duration-200 active:transform active:scale-95"
              >
                Admin
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
