// app/(dashboard)/faturas/[id]/not-found.tsx

import Link from 'next/link';

import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function InvoiceNotFound() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <FileQuestion size={28} />
                </div>

                <h1 className="mt-6 text-2xl font-bold text-slate-900">Fatura não encontrada</h1>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    A fatura pode ter sido excluída ou o endereço acessado é inválido.
                </p>

                <Link
                    href="/faturas"
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <ArrowLeft size={17} />
                    Voltar para faturas
                </Link>
            </div>
        </div>
    );
}
