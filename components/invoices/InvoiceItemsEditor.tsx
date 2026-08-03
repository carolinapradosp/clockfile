// components/invoices/InvoiceItemsEditor.tsx

'use client';

import { Plus } from 'lucide-react';

import InvoiceItemRow from '@/components/invoices/InvoiceItemRow';

import type {
    InvoiceItem,
    InvoiceItemSource,
} from '@/interfaces/Invoice';

type EditableInvoiceItemField =
    | 'description'
    | 'link'
    | 'quantity'
    | 'rate'
    | 'amount'
    | 'source';

type InvoiceItemsEditorProps = {
    items: InvoiceItem[];

    onChange: (
        id: string,
        field: EditableInvoiceItemField,
        value: string
    ) => void;

    onRemove: (id: string) => void;

    onAdd: (
        source: Exclude<
            InvoiceItemSource,
            'monthly-report'
        >
    ) => void;
};

export default function InvoiceItemsEditor({
    items,
    onChange,
    onRemove,
    onAdd,
}: InvoiceItemsEditorProps) {
    return (
        <section>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Itens da fatura
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Revise as horas importadas e adicione outros custos.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onAdd('manual')}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <Plus size={16} />
                        Item
                    </button>

                    <button
                        type="button"
                        onClick={() => onAdd('expense')}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <Plus size={16} />
                        Despesa
                    </button>

                    <button
                        type="button"
                        onClick={() => onAdd('adjustment')}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <Plus size={16} />
                        Ajuste
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <InvoiceItemRow
                        key={item.id}
                        item={item}
                        onChange={onChange}
                        onRemove={onRemove}
                        canRemove={items.length > 1}
                    />
                ))}
            </div>
        </section>
    );
}