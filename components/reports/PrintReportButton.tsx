'use client';

import { Printer } from 'lucide-react';

export default function PrintReportButton() {
    function handlePrint() {
        window.print();
    }

    return (
        <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
            <Printer size={17} />
            Imprimir ou salvar PDF
        </button>
    );
}
