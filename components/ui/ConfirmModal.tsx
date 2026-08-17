// components/ui/ConfirmModal.tsx

'use client';

import { AlertTriangle, X } from 'lucide-react';

type ConfirmModalProps = {
    open: boolean;

    title: string;
    description: string;

    confirmLabel?: string;
    cancelLabel?: string;

    loading?: boolean;

    variant?: 'default' | 'danger';

    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmModal({
    open,
    title,
    description,

    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',

    loading = false,

    variant = 'default',

    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) {
        return null;
    }

    const isDanger = variant === 'danger';

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-950/50
                px-4
                backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <button
                type="button"
                aria-label="Fechar modal"
                onClick={onCancel}
                className="absolute inset-0 cursor-default"
            />

            <div
                className="
                    relative
                    z-10
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-2xl
                "
            >
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    aria-label="Fechar"
                    className="
                        absolute
                        right-4
                        top-4
                        inline-flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-400
                        transition-colors
                        hover:bg-slate-100
                        hover:text-slate-700
                        disabled:opacity-50
                    "
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div
                        className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl

                            ${isDanger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}
                        `}
                    >
                        <AlertTriangle size={21} />
                    </div>

                    <div className="pr-8">
                        <h2 id="confirm-modal-title" className="text-lg font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                    </div>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
                            inline-flex
                            h-11
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-sm
                            font-semibold
                            text-slate-600
                            transition-colors
                            hover:bg-slate-100
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            inline-flex
                            h-11
                            items-center
                            justify-center
                            rounded-xl
                            px-4
                            text-sm
                            font-semibold
                            text-white
                            transition-colors
                            disabled:cursor-wait
                            disabled:opacity-60

                            ${
                                isDanger
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-slate-900 hover:bg-slate-800'
                            }
                        `}
                    >
                        {loading ? 'Processando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
