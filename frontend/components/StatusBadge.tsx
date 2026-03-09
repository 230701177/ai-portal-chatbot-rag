import React from 'react';

type StatusType = 'Indexed' | 'Processing' | 'Failed';

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const map: Record<string, { bg: string; text: string; dot: string }> = {
        Indexed: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
        Processing: { bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]', dot: 'bg-[#CA8A04]' },
        Failed: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
    };

    const s = map[status] ?? map['Failed'];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${s.bg} ${s.text} border-radius-max-8 transition-colors duration-200`}
        >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
            {status}
        </span>
    );
};
