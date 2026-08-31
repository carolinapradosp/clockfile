// components/invoices/InvoiceDocument.tsx

import Image from 'next/image';

import logoPV from '@/public/logo-300.png';

import type { CurrentUser } from '@/lib/auth/current-user';

import type { Invoice } from '@/interfaces/Invoice';
import formatCurrency from '@/lib/utils';

type InvoiceDocumentProps = {
    invoice: Invoice;
    user: CurrentUser;
};

function formatDate(value: string) {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString('en', {
        timeZone: 'UTC',
    });
}

function formatMonth(value: string) {
    const [year, month] = value.split('-').map(Number);

    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function normalizeExternalLink(value: string) {
    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    return `https://${value}`;
}

function getRecipientTitle(invoice: Invoice) {
    return invoice.billTo.company ?? invoice.billTo.name ?? 'Recipient not informed';
}

export default function InvoiceDocument({ invoice, user }: InvoiceDocumentProps) {
    const recipientTitle = getRecipientTitle(invoice);

    const addressParts = [
        invoice.billTo.addressLine1,
        invoice.billTo.addressLine2,
        invoice.billTo.city,
        invoice.billTo.state,
        invoice.billTo.postalCode,
        invoice.billTo.countryCode,
    ].filter((value): value is string => Boolean(value));

    return (
        <article
            id="invoice-document"
            className="invoice-document mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-6 py-8 text-slate-900 shadow-xl sm:px-10 sm:py-10 print:min-h-0 print:max-w-none print:p-0 print:shadow-none"
        >
            {/* CABEÇALHO */}

            <header className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-8 sm:flex-row sm:items-start">
                <div>
                    <Image
                        src={logoPV}
                        alt="Carolina Prado Dev"
                        width={250}
                        height={50}
                        priority
                        className="h-auto w-52.5"
                    />

                    <div className="mt-5 space-y-1 text-sm text-slate-500">
                        <p className="font-semibold text-slate-800">{user.name}</p>

                        <p>{user.email}</p>

                        {user.phone && <p>{user.phone}</p>}
                    </div>
                </div>

                <div className="sm:text-right">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Invoice
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                        #{invoice.invoiceNumber}
                    </h1>
                </div>
            </header>

            {/* EMISSÃO E DESTINATÁRIO */}

            <section className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Bill to
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                        <p className="text-base font-bold text-slate-900">{recipientTitle}</p>

                        {invoice.billTo.company && invoice.billTo.name && (
                            <p>{invoice.billTo.name}</p>
                        )}

                        {invoice.billTo.email && <p>{invoice.billTo.email}</p>}

                        {invoice.billTo.phone && <p>{invoice.billTo.phone}</p>}

                        {addressParts.length > 0 && (
                            <div className="pt-2">
                                {addressParts.map((part, index) => (
                                    <p key={`${part}-${index}`}>{part}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 sm:text-right">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Due date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                            {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Reference
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatMonth(invoice.referenceMonth)}
                        </p>
                    </div>

                    {invoice.projectName && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Project
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {invoice.projectName}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* TOTAL EM DESTAQUE */}

            <section className="mb-8 flex justify-end">
                <div className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-5 py-4 sm:w-auto sm:min-w-80 sm:gap-16">
                    <span className="text-sm font-bold text-slate-700">Balance due</span>

                    <span className="text-2xl font-bold text-slate-950">
                        {formatCurrency({
                            value: invoice.totalAmount,

                            currency: invoice.currency,
                        })}
                    </span>
                </div>
            </section>

            {/* ITENS */}

            <section>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-162.5 border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-950 text-xs font-semibold uppercase tracking-wide text-white">
                                <th className="px-4 py-3">Item</th>

                                <th className="px-4 py-3 text-right">Quantity</th>

                                <th className="px-4 py-3 text-right">Rate</th>

                                <th className="px-4 py-3 text-right">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-200">
                                    <td className="px-4 py-4 align-top">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {item.description}
                                        </p>

                                        {item.link && (
                                            <a
                                                href={normalizeExternalLink(item.link)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 block break-all text-xs text-slate-500"
                                            >
                                                {item.link}
                                            </a>
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

                                    <td className="px-4 py-4 text-right align-top text-sm font-semibold text-slate-900">
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
            </section>

            {/* TOTAIS */}

            <section className="mt-8 flex justify-end">
                <div className="w-full max-w-sm space-y-3 text-sm">
                    <div className="flex justify-between gap-6 text-slate-500">
                        <span>Subtotal</span>

                        <span className="font-semibold text-slate-800">
                            {formatCurrency({
                                value: invoice.subtotal,

                                currency: invoice.currency,
                            })}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 text-slate-500">
                        <span>
                            Tax ({invoice.taxPercentage}
                            %)
                        </span>

                        <span className="font-semibold text-slate-800">
                            {formatCurrency({
                                value: invoice.taxAmount,

                                currency: invoice.currency,
                            })}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 border-t border-slate-200 pt-4 text-base">
                        <span className="font-bold text-slate-900">Total</span>

                        <span className="text-xl font-bold text-slate-950">
                            {formatCurrency({
                                value: invoice.totalAmount,

                                currency: invoice.currency,
                            })}
                        </span>
                    </div>
                </div>
            </section>

            {/* OBSERVAÇÕES */}

            {invoice.notes && (
                <section className="mt-10 border-t border-slate-200 pt-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Notes
                    </p>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                        {invoice.notes}
                    </p>
                </section>
            )}
        </article>
    );
}
