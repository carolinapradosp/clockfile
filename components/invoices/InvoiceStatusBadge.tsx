// components/invoices/InvoiceStatusBadge.tsx

import type {
    InvoiceStatus,
} from '@/interfaces/Invoice';

type InvoiceStatusBadgeProps = {
    status: InvoiceStatus;
};

const STATUS_CONFIG: Record<
    InvoiceStatus,
    {
        label: string;
        className: string;
    }
> = {
    draft: {
        label: 'Rascunho',
        className:
            'border-slate-200 bg-slate-100 text-slate-600',
    },

    issued: {
        label: 'Emitida',
        className:
            'border-blue-200 bg-blue-50 text-blue-700',
    },

    sent: {
        label: 'Enviada',
        className:
            'border-violet-200 bg-violet-50 text-violet-700',
    },

    paid: {
        label: 'Paga',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    overdue: {
        label: 'Vencida',
        className:
            'border-red-200 bg-red-50 text-red-700',
    },

    cancelled: {
        label: 'Cancelada',
        className:
            'border-slate-300 bg-slate-50 text-slate-500',
    },
};

export default function InvoiceStatusBadge({
    status,
}: InvoiceStatusBadgeProps) {
    const config =
        STATUS_CONFIG[status];

    return (
        <span
            className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${config.className}
      `}
        >
            {config.label}
        </span>
    );
}