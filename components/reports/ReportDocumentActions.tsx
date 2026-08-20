'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

type ReportDocumentActionsProps = {
    month: string;
    projectId?: string;
};

export default function ReportDocumentActions({ month, projectId }: ReportDocumentActionsProps) {
    function handlePrint() {
        window.print();
    }

    const query = new URLSearchParams();

    query.set('month', month);

    if (projectId) {
        query.set('projectId', projectId);
    }

    return (
        <div className="report-print-actions mx-auto mb-6 flex w-full max-w-[210mm] flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <Link
                href={`/relatorios?${query.toString()}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
                <ArrowLeft size={17} />
                Voltar para relatórios
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
