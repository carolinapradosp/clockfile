// app/(print)/faturas/[id]/imprimir/page.tsx

import type {
    Metadata,
} from 'next';

import {
    notFound,
} from 'next/navigation';

import {
    getInvoiceById,
} from '@/app/actions/invoice';

import InvoiceDocument from '@/components/invoices/InvoiceDocument';
import InvoiceDocumentActions from '@/components/invoices/InvoiceDocumentActions';

import {
    requireCurrentUser,
} from '@/lib/auth/current-user';

type PrintInvoicePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export const metadata: Metadata = {
    title: 'Imprimir fatura',
};

export default async function PrintInvoicePage({
    params,
}: PrintInvoicePageProps) {
    const { id } =
        await params;

    const [
        invoice,
        user,
    ] = await Promise.all([
        getInvoiceById(id),
        requireCurrentUser(),
    ]);

    if (!invoice) {
        notFound();
    }

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 print:p-0">
            <InvoiceDocumentActions
                invoiceId={invoice.id}
            />

            <InvoiceDocument
                invoice={invoice}
                user={user}
            />
        </main>
    );
}