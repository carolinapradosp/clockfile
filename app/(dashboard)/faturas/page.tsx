// app/(dashboard)/faturas/page.tsx

import Link from 'next/link';

import { CircleDollarSign, Clock3, FileText, Plus, ReceiptText } from 'lucide-react';

import { getInvoiceProjectOptions, getInvoices } from '@/app/actions/invoice';

import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import InvoicesTable from '@/components/invoices/InvoicesTable';

import type { InvoiceStatus } from '@/interfaces/Invoice';
import formatCurrency, { isValidMonth } from '@/lib/utils';

type InvoicesPageProps = {
    searchParams: Promise<{
        month?: string;
        projectId?: string;
        status?: string;
    }>;
};

const VALID_STATUSES: InvoiceStatus[] = ['draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled'];

function normalizeStatus(value?: string): InvoiceStatus | undefined {
    return VALID_STATUSES.includes(value as InvoiceStatus) ? (value as InvoiceStatus) : undefined;
}

function groupTotalsByCurrency(
    values: Array<{
        currency: string;
        totalAmount: number;
    }>
) {
    return values.reduce<Record<string, number>>((totals, item) => {
        totals[item.currency] = (totals[item.currency] ?? 0) + item.totalAmount;

        return totals;
    }, {});
}

function TotalsList({ totals }: { totals: Record<string, number> }) {
    const entries = Object.entries(totals);

    if (entries.length === 0) {
        return <p className="mt-3 text-2xl font-bold text-slate-900">$0.00</p>;
    }

    return (
        <div className="mt-3 space-y-1">
            {entries.map(([currency, value]) => (
                <p key={currency} className="text-xl font-bold text-slate-900">
                    {formatCurrency({
                        value,
                        currency,
                    })}
                </p>
            ))}
        </div>
    );
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
    const params = await searchParams;

    const selectedMonth = isValidMonth(params.month) ? params.month : undefined;

    const selectedStatus = normalizeStatus(params.status);

    const selectedProjectId = params.projectId || undefined;

    const [invoices, projects] = await Promise.all([
        getInvoices({
            month: selectedMonth,

            projectId: selectedProjectId,

            status: selectedStatus,
        }),

        getInvoiceProjectOptions(),
    ]);

    const issuedInvoices = invoices.filter(
        (invoice) => invoice.status !== 'draft' && invoice.status !== 'cancelled'
    );

    const pendingInvoices = invoices.filter(
        (invoice) =>
            invoice.status === 'issued' || invoice.status === 'sent' || invoice.status === 'overdue'
    );

    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid');

    const issuedTotals = groupTotalsByCurrency(issuedInvoices);

    const pendingTotals = groupTotalsByCurrency(pendingInvoices);

    const paidTotals = groupTotalsByCurrency(paidInvoices);

    const newInvoiceParams = new URLSearchParams();

    if (selectedProjectId) {
        newInvoiceParams.set('projectId', selectedProjectId);
    }

    if (selectedMonth) {
        newInvoiceParams.set('month', selectedMonth);
    }

    const newInvoiceHref =
        newInvoiceParams.size > 0
            ? `/faturas/novo?${newInvoiceParams.toString()}`
            : '/faturas/novo';

    return (
        <div>
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faturas</h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Crie, acompanhe e gerencie as cobranças dos seus clientes.
                    </p>
                </div>

                <Link
                    href={newInvoiceHref}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Nova fatura
                </Link>
            </header>

            <InvoiceFilters
                projects={projects}
                selectedMonth={selectedMonth}
                selectedProjectId={selectedProjectId}
                selectedStatus={selectedStatus}
            />

            <section className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Faturas</p>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                                {invoices.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total emitido</p>

                            <TotalsList totals={issuedTotals} />
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <ReceiptText size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">A receber</p>

                            <TotalsList totals={pendingTotals} />
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Clock3 size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Recebido</p>

                            <TotalsList totals={paidTotals} />
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CircleDollarSign size={21} />
                        </div>
                    </div>
                </article>
            </section>

            <InvoicesTable invoices={invoices} />
        </div>
    );
}
