// app/(dashboard)/faturas/novo/page.tsx

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import {
    getInvoiceProjectOptions,
} from '@/app/actions/invoice';

import InvoiceForm from '@/components/invoices/InvoiceForm';

type NewInvoicePageProps = {
    searchParams: Promise<{
        projectId?: string;
        month?: string;
    }>;
};

function isValidMonth(
    value?: string
): value is string {
    return Boolean(
        value &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(
            value
        )
    );
}

export default async function NewInvoicePage({
    searchParams,
}: NewInvoicePageProps) {
    const params =
        await searchParams;

    const projects =
        await getInvoiceProjectOptions();

    const initialProject =
        projects.find(
            (project) =>
                project.id ===
                params.projectId
        );

    return (
        <div className="mx-auto max-w-6xl">
            <Link
                href="/faturas"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para faturas
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Nova fatura
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Informe o destinatário, importe horas do projeto ou adicione itens manualmente.
                </p>
            </header>

            <InvoiceForm
                projects={projects}
                initialProjectId={
                    initialProject?.id
                }
                initialMonth={
                    isValidMonth(params.month)
                        ? params.month
                        : undefined
                }
            />
        </div>
    );
}