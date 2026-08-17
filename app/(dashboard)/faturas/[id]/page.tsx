// app/(dashboard)/faturas/[id]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Clock3,
    Edit3,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Phone,
    Printer,
    ReceiptText,
} from 'lucide-react';

import { getInvoiceById } from '@/app/actions/invoice';

import InvoiceStatusActions from '@/components/invoices/InvoiceStatusActions';
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';
import DeleteInvoiceButton from '@/components/invoices/DeleteInvoiceButton';
import formatCurrency, { formatDate, formatDateTime, formatReferenceMonth } from '@/lib/utils';

type InvoiceDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function normalizeExternalLink(value: string) {
    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    return `https://${value}`;
}

export default async function InvoiceDetailsPage({ params }: InvoiceDetailsPageProps) {
    const { id } = await params;

    const invoice = await getInvoiceById(id);

    if (!invoice) {
        notFound();
    }

    const recipientDisplayName =
        invoice.billTo.company ?? invoice.billTo.name ?? 'Destinatário não informado';

    const addressParts = [
        invoice.billTo.addressLine1,
        invoice.billTo.addressLine2,
        invoice.billTo.city,
        invoice.billTo.state,
        invoice.billTo.postalCode,
        invoice.billTo.countryCode,
    ].filter(Boolean);

    return (
        <div className="mx-auto max-w-6xl">
            <Link
                href="/faturas"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />
                Voltar para faturas
            </Link>

            <header className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Fatura #{invoice.invoiceNumber}
                        </h1>

                        <InvoiceStatusBadge status={invoice.status} />
                    </div>

                    <p className="mt-2 text-sm capitalize text-slate-500">
                        Referência: {formatReferenceMonth(invoice.referenceMonth)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/faturas/${invoice.id}/imprimir`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <Printer size={17} />
                        Imprimir
                    </Link>

                    {invoice.status === 'draft' && (
                        <Link
                            href={`/faturas/${invoice.id}/editar`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            <Edit3 size={17} />
                            Editar
                        </Link>
                    )}
                </div>
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Ações da fatura</h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Atualize o estágio da cobrança conforme o andamento com o cliente.
                        </p>
                    </div>

                    <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ReceiptText size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Informações da cobrança
                            </h2>

                            <p className="text-sm text-slate-500">
                                Datas, projeto e condições da fatura.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Data da fatura
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <CalendarDays size={16} />

                                {formatDate(invoice.invoiceDate)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Vencimento
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Clock3 size={16} />

                                {formatDate(invoice.dueDate)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Projeto
                            </p>

                            {invoice.projectId ? (
                                <Link
                                    href={`/projetos/${invoice.projectId}`}
                                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    <FileText size={16} />

                                    {invoice.projectName}
                                </Link>
                            ) : (
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Sem projeto específico
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Moeda
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-700">
                                {invoice.currency}
                            </p>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Observações
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                                {invoice.notes}
                            </p>
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Building2 size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Cobrar de</h2>

                            <p className="text-sm text-slate-500">
                                Dados do destinatário registrados na fatura.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="font-bold text-slate-900">{recipientDisplayName}</p>

                        {invoice.billTo.company && invoice.billTo.name && (
                            <p className="mt-1 text-sm text-slate-500">{invoice.billTo.name}</p>
                        )}

                        {invoice.billTo.email && (
                            <p className="mt-4 flex items-start gap-2 text-sm text-slate-500">
                                <Mail size={15} className="mt-0.5 shrink-0" />

                                <span className="break-all">{invoice.billTo.email}</span>
                            </p>
                        )}

                        {invoice.billTo.phone && (
                            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                <Phone size={15} className="shrink-0" />

                                {invoice.billTo.phone}
                            </p>
                        )}

                        {addressParts.length > 0 && (
                            <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
                                <MapPin size={15} className="mt-0.5 shrink-0" />

                                <div>
                                    {addressParts.map((part, index) => (
                                        <p key={`${part}-${index}`}>{part}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Itens da fatura</h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Serviços, despesas e ajustes incluídos na cobrança.
                        </p>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-3xl border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-3">Item</th>

                                    <th className="px-4 py-3 text-right">Quantidade</th>

                                    <th className="px-4 py-3 text-right">Rate</th>

                                    <th className="px-4 py-3 text-right">Valor</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="px-4 py-4 align-top">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {item.description}
                                            </p>

                                            {item.link && (
                                                <a
                                                    href={normalizeExternalLink(item.link)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                >
                                                    {item.link}

                                                    <ExternalLink size={12} />
                                                </a>
                                            )}

                                            {item.reportEntryIds.length > 0 && (
                                                <p className="mt-2 text-xs text-slate-400">
                                                    {item.reportEntryIds.length}{' '}
                                                    {item.reportEntryIds.length === 1
                                                        ? 'lançamento vinculado'
                                                        : 'lançamentos vinculados'}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-right align-top text-sm text-slate-600">
                                            {item.quantity ?? '—'}
                                        </td>

                                        <td className="px-4 py-4 text-right align-top text-sm text-slate-600">
                                            {item.rate !== null
                                                ? formatCurrency({
                                                      value: item.rate,
                                                      currency: invoice.currency,
                                                  })
                                                : '—'}
                                        </td>

                                        <td className="px-4 py-4 text-right align-top text-sm font-bold text-slate-900">
                                            {formatCurrency({
                                                value: item.amount,
                                                currency: invoice.currency,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-sm space-y-3 rounded-xl bg-slate-50 p-5 text-sm">
                            <div className="flex justify-between gap-4 text-slate-500">
                                <span>Subtotal</span>

                                <span className="font-semibold text-slate-800">
                                    {formatCurrency({
                                        value: invoice.subtotal,
                                        currency: invoice.currency,
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-slate-500">
                                <span>Imposto ({invoice.taxPercentage}%)</span>

                                <span className="font-semibold text-slate-800">
                                    {formatCurrency({
                                        value: invoice.taxAmount,
                                        currency: invoice.currency,
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
                                <span className="font-bold text-slate-900">Total</span>

                                <span className="text-xl font-bold text-slate-900">
                                    {formatCurrency({
                                        value: invoice.totalAmount,
                                        currency: invoice.currency,
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <h2 className="text-lg font-bold text-slate-900">Histórico</h2>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Emitida
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {formatDateTime(invoice.issuedAt) ?? 'Ainda não emitida'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Enviada
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {formatDateTime(invoice.sentAt) ?? 'Ainda não enviada'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Paga
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {formatDateTime(invoice.paidAt) ?? 'Pagamento pendente'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Cancelada
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {formatDateTime(invoice.cancelledAt) ?? 'Não cancelada'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <section className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-6">
                <h2 className="text-lg font-bold text-red-800">Excluir fatura</h2>

                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-red-700/80">
                    A exclusão remove permanentemente a fatura e seus itens. Os lançamentos de horas
                    vinculados serão liberados e poderão ser incluídos em outra fatura.
                </p>

                {invoice.status === 'paid' && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-white p-4 text-sm font-medium text-red-700">
                        Atenção: esta fatura está marcada como paga. A exclusão também removerá o
                        histórico desse recebimento.
                    </div>
                )}

                <div className="mt-5">
                    <DeleteInvoiceButton
                        invoiceId={invoice.id}
                        invoiceNumber={invoice.invoiceNumber}
                        invoiceStatus={invoice.status}
                    />
                </div>
            </section>
        </div>
    );
}
