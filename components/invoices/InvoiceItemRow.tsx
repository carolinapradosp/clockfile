// components/invoices/InvoiceItemRow.tsx

'use client';

import { Trash2 } from 'lucide-react';

import type { InvoiceItem, InvoiceItemSource } from '@/interfaces/Invoice';
import { inputClassNameNoIcon } from '@/lib/utils';

type EditableInvoiceItemField = 'description' | 'link' | 'quantity' | 'rate' | 'amount' | 'source';

type InvoiceItemRowProps = {
    item: InvoiceItem;

    onChange: (id: string, field: EditableInvoiceItemField, value: string) => void;

    onRemove: (id: string) => void;

    canRemove: boolean;
};

const SOURCE_LABELS: Record<InvoiceItemSource, string> = {
    'monthly-report': 'Horas do relatório',
    manual: 'Item manual',
    expense: 'Despesa',
    adjustment: 'Ajuste',
};

export default function InvoiceItemRow({
    item,
    onChange,
    onRemove,
    canRemove,
}: InvoiceItemRowProps) {
    const isReportItem = item.source === 'monthly-report';

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-slate-900">{SOURCE_LABELS[item.source]}</p>

                    {isReportItem && (
                        <p className="mt-1 text-xs text-slate-500">
                            {item.reportEntryIds.length}{' '}
                            {item.reportEntryIds.length === 1
                                ? 'lançamento vinculado'
                                : 'lançamentos vinculados'}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={!canRemove}
                    title="Remover item"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <Trash2 size={17} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <label
                        htmlFor={`description-${item.id}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Descrição
                    </label>

                    <input
                        id={`description-${item.id}`}
                        type="text"
                        value={item.description}
                        onChange={(event) => onChange(item.id, 'description', event.target.value)}
                        placeholder="Descrição do item"
                        className={inputClassNameNoIcon}
                    />

                    <input
                        type="text"
                        value={item.link}
                        onChange={(event) => onChange(item.id, 'link', event.target.value)}
                        placeholder="Link ou URL do projeto"
                        className={`${inputClassNameNoIcon} mt-3`}
                    />
                </div>

                <div className="lg:col-span-2">
                    <label
                        htmlFor={`quantity-${item.id}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Quantidade
                    </label>

                    <input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) => onChange(item.id, 'quantity', event.target.value)}
                        placeholder="0"
                        className={`${inputClassNameNoIcon} text-right`}
                    />
                </div>

                <div className="lg:col-span-2">
                    <label
                        htmlFor={`rate-${item.id}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Rate
                    </label>

                    <input
                        id={`rate-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(event) => onChange(item.id, 'rate', event.target.value)}
                        placeholder="0.00"
                        className={`${inputClassNameNoIcon} text-right`}
                    />
                </div>

                <div className="lg:col-span-3">
                    <label
                        htmlFor={`amount-${item.id}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Valor
                    </label>

                    <input
                        id={`amount-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(event) => onChange(item.id, 'amount', event.target.value)}
                        placeholder="0.00"
                        className={`${inputClassNameNoIcon} text-right font-semibold`}
                    />
                </div>

                {!isReportItem && (
                    <div className="lg:col-span-4">
                        <label
                            htmlFor={`source-${item.id}`}
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            Tipo
                        </label>

                        <select
                            id={`source-${item.id}`}
                            value={item.source}
                            onChange={(event) => onChange(item.id, 'source', event.target.value)}
                            className={inputClassNameNoIcon}
                        >
                            <option value="manual">Item manual</option>

                            <option value="expense">Despesa</option>

                            <option value="adjustment">Ajuste</option>
                        </select>
                    </div>
                )}
            </div>
        </article>
    );
}
