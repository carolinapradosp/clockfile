// app/(dashboard)/faturas/[id]/editar/page.tsx

import Link from 'next/link';

import {
    notFound,
    redirect,
} from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import {
    getInvoiceById,
    getInvoiceClientOptions,
    getInvoiceProjectOptions,
} from '@/app/actions/invoice';

import InvoiceForm from '@/components/invoices/InvoiceForm';

type EditInvoicePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditInvoicePage({
    params,
}: EditInvoicePageProps) {
    const { id } = await params;

    const [
        invoice,
        clients,
        projects,
    ] = await Promise.all([
        getInvoiceById(id),
        getInvoiceClientOptions(),
        getInvoiceProjectOptions(),
    ]);

    if (!invoice) {
        notFound();
    }

    /*
     * Nesta primeira versão, somente rascunhos
     * podem ser editados livremente.
     */
    if (invoice.status !== 'draft') {
        redirect(`/faturas/${invoice.id}`);
    }

    return (
        <div className="mx-auto max-w-6xl">
            <Link
                href={`/faturas/${invoice.id}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para a fatura
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Editar fatura #{invoice.invoiceNumber}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Atualize os dados, itens e valores do rascunho.
                </p>
            </header>

            <InvoiceForm
                invoice={invoice}
                clients={clients}
                projects={projects}
            />
        </div>
    );
}