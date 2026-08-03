// components/invoices/DeleteInvoiceButton.tsx

'use client';

import {
    LoaderCircle,
    Trash2,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    deleteInvoice,
} from '@/app/actions/invoice';

import type {
    InvoiceStatus,
} from '@/interfaces/Invoice';

type DeleteInvoiceButtonProps = {
    invoiceId: string;
    invoiceNumber: string;
    invoiceStatus: InvoiceStatus;
    variant?: 'button' | 'icon';
};

const STATUS_LABELS: Record<
    InvoiceStatus,
    string
> = {
    draft: 'rascunho',
    issued: 'emitida',
    sent: 'enviada',
    paid: 'paga',
    overdue: 'vencida',
    cancelled: 'cancelada',
};

export default function DeleteInvoiceButton({
    invoiceId,
    invoiceNumber,
    invoiceStatus,
    variant = 'button',
}: DeleteInvoiceButtonProps) {
    const router = useRouter();

    const [isPending, setIsPending] =
        useState(false);

    const [error, setError] =
        useState('');

    async function handleDelete() {
        const statusLabel =
            STATUS_LABELS[invoiceStatus];

        const confirmed =
            window.confirm(
                [
                    `Deseja excluir definitivamente a fatura #${invoiceNumber}?`,
                    '',
                    `Status atual: ${statusLabel}.`,
                    '',
                    'Todos os itens da fatura também serão removidos.',
                    'Os lançamentos de horas vinculados voltarão a ficar disponíveis para faturamento.',
                    '',
                    'Essa ação não poderá ser desfeita.',
                ].join('\n')
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsPending(true);
            setError('');

            const result =
                await deleteInvoice(
                    invoiceId
                );

            if (!result.success) {
                setError(result.message);
                return;
            }

            router.replace('/faturas');
            router.refresh();
        } catch (deleteError) {
            console.error(
                'Erro ao excluir fatura:',
                deleteError
            );

            setError(
                'Não foi possível excluir a fatura.'
            );
        } finally {
            setIsPending(false);
        }
    }

    if (variant === 'icon') {
        return (
            <div className="flex flex-col items-end">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    title={`Excluir fatura #${invoiceNumber}`}
                    aria-label={`Excluir fatura ${invoiceNumber}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
                >
                    {isPending ? (
                        <LoaderCircle
                            size={16}
                            className="animate-spin"
                        />
                    ) : (
                        <Trash2 size={16} />
                    )}
                </button>

                {error && (
                    <p className="mt-1 max-w-48 text-right text-xs font-medium text-red-600">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
            >
                {isPending ? (
                    <LoaderCircle
                        size={17}
                        className="animate-spin"
                    />
                ) : (
                    <Trash2 size={17} />
                )}

                {isPending
                    ? 'Excluindo...'
                    : 'Excluir fatura'}
            </button>

            {error && (
                <p className="mt-2 max-w-80 text-sm font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}