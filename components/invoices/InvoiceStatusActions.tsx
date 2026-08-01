// components/invoices/InvoiceStatusActions.tsx

'use client';

import {
    Ban,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    LoaderCircle,
    Send,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    updateInvoiceStatus,
} from '@/app/actions/invoice';

import type {
    InvoiceStatus,
} from '@/interfaces/Invoice';

type InvoiceStatusActionsProps = {
    invoiceId: string;
    currentStatus: InvoiceStatus;
};

type StatusAction = {
    status: InvoiceStatus;
    label: string;
    confirmation: string;
    icon: React.ReactNode;
    className: string;
};

const STATUS_ACTIONS: Partial<
    Record<InvoiceStatus, StatusAction[]>
> = {
    draft: [
        {
            status: 'issued',
            label: 'Emitir fatura',
            confirmation:
                'Deseja emitir esta fatura? Depois da emissão, a edição ficará bloqueada.',
            icon: <CheckCircle2 size={17} />,
            className:
                'bg-blue-600 text-white hover:bg-blue-700',
        },
    ],

    issued: [
        {
            status: 'sent',
            label: 'Marcar como enviada',
            confirmation:
                'Confirma que esta fatura foi enviada ao cliente?',
            icon: <Send size={17} />,
            className:
                'bg-violet-600 text-white hover:bg-violet-700',
        },

        {
            status: 'paid',
            label: 'Marcar como paga',
            confirmation:
                'Confirma o recebimento integral desta fatura?',
            icon: <CircleDollarSign size={17} />,
            className:
                'bg-emerald-600 text-white hover:bg-emerald-700',
        },

        {
            status: 'cancelled',
            label: 'Cancelar',
            confirmation:
                'Deseja cancelar esta fatura? Os lançamentos vinculados voltarão a ficar disponíveis somente se a fatura for excluída ou os vínculos forem removidos.',
            icon: <Ban size={17} />,
            className:
                'border border-red-200 bg-white text-red-600 hover:bg-red-50',
        },
    ],

    sent: [
        {
            status: 'paid',
            label: 'Marcar como paga',
            confirmation:
                'Confirma o recebimento integral desta fatura?',
            icon: <CircleDollarSign size={17} />,
            className:
                'bg-emerald-600 text-white hover:bg-emerald-700',
        },

        {
            status: 'overdue',
            label: 'Marcar como vencida',
            confirmation:
                'Deseja marcar esta fatura como vencida?',
            icon: <Clock3 size={17} />,
            className:
                'border border-red-200 bg-white text-red-600 hover:bg-red-50',
        },

        {
            status: 'cancelled',
            label: 'Cancelar',
            confirmation:
                'Deseja cancelar esta fatura?',
            icon: <Ban size={17} />,
            className:
                'border border-red-200 bg-white text-red-600 hover:bg-red-50',
        },
    ],

    overdue: [
        {
            status: 'paid',
            label: 'Marcar como paga',
            confirmation:
                'Confirma o recebimento integral desta fatura?',
            icon: <CircleDollarSign size={17} />,
            className:
                'bg-emerald-600 text-white hover:bg-emerald-700',
        },

        {
            status: 'sent',
            label: 'Reenviada ao cliente',
            confirmation:
                'Deseja registrar esta fatura novamente como enviada?',
            icon: <Send size={17} />,
            className:
                'bg-violet-600 text-white hover:bg-violet-700',
        },

        {
            status: 'cancelled',
            label: 'Cancelar',
            confirmation:
                'Deseja cancelar esta fatura?',
            icon: <Ban size={17} />,
            className:
                'border border-red-200 bg-white text-red-600 hover:bg-red-50',
        },
    ],
};

export default function InvoiceStatusActions({
    invoiceId,
    currentStatus,
}: InvoiceStatusActionsProps) {
    const router = useRouter();

    const [pendingStatus, setPendingStatus] =
        useState<InvoiceStatus | null>(null);

    const [error, setError] = useState('');

    const actions =
        STATUS_ACTIONS[currentStatus] ?? [];

    async function handleStatusChange(
        action: StatusAction
    ) {
        const confirmed = window.confirm(
            action.confirmation
        );

        if (!confirmed) {
            return;
        }

        try {
            setPendingStatus(action.status);
            setError('');

            const result =
                await updateInvoiceStatus({
                    invoiceId,
                    status: action.status,
                });

            if (!result.success) {
                setError(result.message);
                return;
            }

            router.refresh();
        } catch (statusError) {
            console.error(
                'Erro ao atualizar status da fatura:',
                statusError
            );

            setError(
                'Não foi possível atualizar o status da fatura.'
            );
        } finally {
            setPendingStatus(null);
        }
    }

    if (actions.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex flex-wrap gap-3">
                {actions.map((action) => {
                    const isPending =
                        pendingStatus === action.status;

                    return (
                        <button
                            key={action.status}
                            type="button"
                            onClick={() =>
                                handleStatusChange(action)
                            }
                            disabled={pendingStatus !== null}
                            className={`
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                text-sm
                font-semibold
                transition-colors
                disabled:cursor-wait
                disabled:opacity-50
                ${action.className}
              `}
                        >
                            {isPending ? (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                action.icon
                            )}

                            {isPending
                                ? 'Atualizando...'
                                : action.label}
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="mt-3 text-sm font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}