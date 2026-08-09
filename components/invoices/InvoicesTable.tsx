// components/invoices/InvoicesTable.tsx

import Link from 'next/link';

import {
    Building2,
    Edit3,
    Eye,
    FileText,
} from 'lucide-react';

import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';

import type {
    InvoiceSummary,
} from '@/interfaces/Invoice';
import DeleteInvoiceButton from './DeleteInvoiceButton';
import formatCurrency, { formatDate, formatReferenceMonth } from '@/lib/utils';

type InvoicesTableProps = {
    invoices: InvoiceSummary[];
};


export default function InvoicesTable({
    invoices,
}: InvoicesTableProps) {
    if (invoices.length === 0) {
        return (
            <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <FileText size={25} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                    Nenhuma fatura encontrada
                </h2>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Não existem faturas correspondentes aos filtros selecionados.
                </p>

                <Link
                    href="/faturas/novo"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    Criar fatura
                </Link>
            </section>
        );
    }

    return (
        <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-4">
                                    Fatura
                                </th>

                                <th className="px-5 py-4">
                                    Cliente
                                </th>

                                <th className="px-5 py-4">
                                    Referência
                                </th>

                                <th className="px-5 py-4">
                                    Vencimento
                                </th>

                                <th className="px-5 py-4">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Total
                                </th>

                                <th className="w-28 px-5 py-4 text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoices.map(
                                (invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="px-5 py-4 align-top">
                                            <Link
                                                href={`/faturas/${invoice.id}`}
                                                className="text-sm font-bold text-slate-900 transition-colors hover:text-blue-600"
                                            >
                                                #{invoice.invoiceNumber}
                                            </Link>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Emitida em{' '}
                                                {formatDate(
                                                    invoice.invoiceDate
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <div className="flex items-start gap-2">
                                                <Building2
                                                    size={15}
                                                    className="mt-0.5 shrink-0 text-slate-400"
                                                />

                                                <div>
                                                    {invoice.projectName && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {invoice.projectName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 align-top text-sm capitalize text-slate-600">
                                            {formatReferenceMonth(
                                                invoice.referenceMonth
                                            )}
                                        </td>

                                        <td className="px-5 py-4 align-top text-sm text-slate-600">
                                            {formatDate(
                                                invoice.dueDate
                                            )}
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <InvoiceStatusBadge
                                                status={
                                                    invoice.status
                                                }
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-right align-top text-sm font-bold text-slate-900">
                                            {formatCurrency({
                                                value:
                                                    invoice.totalAmount,

                                                currency:
                                                    invoice.currency,
                                            })}
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={`/faturas/${invoice.id}`}
                                                    title="Visualizar fatura"
                                                    aria-label={`Visualizar fatura ${invoice.invoiceNumber}`}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye size={16} />
                                                </Link>

                                                {invoice.status ===
                                                    'draft' && (
                                                        <Link
                                                            href={`/faturas/${invoice.id}/editar`}
                                                            title="Editar fatura"
                                                            aria-label={`Editar fatura ${invoice.invoiceNumber}`}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                                        >
                                                            <Edit3
                                                                size={16}
                                                            />
                                                        </Link>
                                                    )}

                                                <DeleteInvoiceButton
                                                    invoiceId={invoice.id}
                                                    invoiceNumber={
                                                        invoice.invoiceNumber
                                                    }
                                                    invoiceStatus={
                                                        invoice.status
                                                    }
                                                    variant="icon"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-4 lg:hidden">
                {invoices.map((invoice) => (
                    <article
                        key={invoice.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Link
                                    href={`/faturas/${invoice.id}`}
                                    className="text-lg font-bold text-slate-900"
                                >
                                    Fatura #{invoice.invoiceNumber}
                                </Link>

                                <p className="mt-1 text-xs capitalize text-slate-400">
                                    {formatReferenceMonth(
                                        invoice.referenceMonth
                                    )}
                                </p>
                            </div>

                            <InvoiceStatusBadge
                                status={invoice.status}
                            />
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                            {invoice.projectName && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {invoice.projectName}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Vencimento
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {formatDate(
                                        invoice.dueDate
                                    )}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-400">
                                    Total
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {formatCurrency({
                                        value:
                                            invoice.totalAmount,

                                        currency:
                                            invoice.currency,
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                            <Link
                                href={`/faturas/${invoice.id}`}
                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
                            >
                                <Eye size={16} />

                                Visualizar
                            </Link>

                            {invoice.status ===
                                'draft' && (
                                    <Link
                                        href={`/faturas/${invoice.id}/editar`}
                                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                                    >
                                        <Edit3 size={16} />

                                        Editar
                                    </Link>
                                )}

                            <DeleteInvoiceButton
                                invoiceId={invoice.id}
                                invoiceNumber={
                                    invoice.invoiceNumber
                                }
                                invoiceStatus={
                                    invoice.status
                                }
                                variant="icon"
                            />
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}