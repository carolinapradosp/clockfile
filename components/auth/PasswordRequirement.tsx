import { Check, X } from 'lucide-react';

export default function PasswordRequirement({
    valid,
    children,
}: {
    valid: boolean;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`
                flex
                items-center
                gap-2
                text-xs
                transition-colors
                ${valid ? 'text-emerald-600' : 'text-slate-400'}
            `}
        >
            {valid ? (
                <Check size={14} className="shrink-0" />
            ) : (
                <X size={14} className="shrink-0" />
            )}

            <span>{children}</span>
        </div>
    );
}
