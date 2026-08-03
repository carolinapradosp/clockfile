// components/invoices/InvoiceDocumentActions.tsx

'use client';

import Link from 'next/link';

import {
    ArrowLeft,
    Printer,
} from 'lucide-react';

type InvoiceDocumentActionsProps = {
    invoiceId: string;
};

export default function InvoiceDocumentActions({
    invoiceId,
}: InvoiceDocumentActionsProps) {
    function handlePrint() {
        window.print();
    }

    return (
        <div className="invoice-print-actions mx-auto mb-6 flex w-full max-w-[210mm] flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <Link
                href={`/faturas/${invoiceId}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
                <ArrowLeft size={17} />

                Voltar para a fatura
            </Link>

            <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
                <Printer size={17} />

                Imprimir ou salvar PDF
            </button>
        </div>
    );
}