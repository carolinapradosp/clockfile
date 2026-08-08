// components/support/ReportBugButton.tsx

'use client';

import {
    Bug,
} from 'lucide-react';

import {
    useState,
} from 'react';

import ReportBugModal from '@/components/support/ReportBugModal';

type ReportBugButtonProps = {
    collapsed?: boolean;
};

export default function ReportBugButton({
    collapsed = false,
}: ReportBugButtonProps) {
    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() =>
                    setIsOpen(true)
                }
                title={
                    collapsed
                        ? 'Reportar problema'
                        : undefined
                }
                className={`
                    flex
                    w-full
                    items-center
                    rounded-xl
                    text-sm
                    cursor-pointer
                    font-semibold
                    text-slate-500
                    transition-colors
                    hover:bg-slate-100
                    hover:text-slate-900

                    ${collapsed
                        ? 'h-11 justify-center px-0'
                        : 'min-h-11 gap-3 px-3 py-2'
                    }
                `}
            >
                <Bug
                    size={18}
                    className="shrink-0"
                />

                {!collapsed && (
                    <span>
                        Reportar problema
                    </span>
                )}
            </button>

            <ReportBugModal
                open={isOpen}
                onClose={() =>
                    setIsOpen(false)
                }
            />
        </>
    );
}