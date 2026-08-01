// components/InvoiceBuilder.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Printer,
    Save,
} from 'lucide-react';

import { saveInvoice } from '@/app/actions/invoice';
import InvoiceItemRow from '@/components/invoices/InvoiceItemRow';
import Logo from '@/components/layout/Logo';
import Title from '@/components/ui/Title';

import type {
    InvoiceInitialData,
    InvoiceItem,
} from '@/interfaces/Invoice';

type InvoiceBuilderProps = {
    initialData: InvoiceInitialData;
};

function createEmptyItem(): InvoiceItem {
    return {
        id: crypto.randomUUID(),
        description: '',
        link: '',
        quantity: '',
        rate: '',
        amount: '',
        source: 'manual',
    };
}

function parseNumber(value: string): number {
    if (!value.trim()) {
        return 0;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}

function parseOptionalNumber(
    value: string
): number | null {
    if (!value.trim()) {
        return null;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : null;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

function formatOptionalNumber(
    value: string
): string {
    if (!value.trim()) {
        return '-';
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
        return '-';
    }

    return parsedValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatInvoiceDate(
    value: string
): string {
    const parsedDate = new Date(
        `${value}T00:00:00Z`
    );

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return value;
    }

    return parsedDate.toLocaleDateString(
        'en-US',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        }
    );
}

export default function InvoiceBuilder({
    initialData,
}: InvoiceBuilderProps) {
    const router = useRouter();

    const [items, setItems] = useState<InvoiceItem[]>(
        initialData.items.length > 0
            ? initialData.items
            : [createEmptyItem()]
    );

    const [
        invoiceNumber,
        setInvoiceNumber,
    ] = useState(
        initialData.invoiceNumber
    );

    const [
        taxPercentage,
        setTaxPercentage,
    ] = useState(
        String(initialData.taxPercentage)
    );

    const [saving, setSaving] =
        useState(false);

    const [
        saveMessage,
        setSaveMessage,
    ] = useState('');

    const [
        saveSucceeded,
        setSaveSucceeded,
    ] = useState(false);

    const subtotal = useMemo(() => {
        return items.reduce(
            (total, item) =>
                total +
                parseNumber(item.amount),
            0
        );
    }, [items]);

    const parsedTaxPercentage =
        parseNumber(taxPercentage);

    const taxAmount =
        subtotal *
        (parsedTaxPercentage / 100);

    const total =
        subtotal + taxAmount;

    function handleItemChange(
        id: string,
        field: keyof InvoiceItem,
        value: string
    ) {
        setItems((currentItems) =>
            currentItems.map((item) => {
                if (item.id !== id) {
                    return item;
                }

                const updatedItem: InvoiceItem = {
                    ...item,
                    [field]: value,
                };

                /*
                 * Quando quantity ou rate mudarem,
                 * recalculamos o amount se os dois
                 * campos estiverem preenchidos.
                 *
                 * O amount continua editável.
                 */
                if (
                    field === 'quantity' ||
                    field === 'rate'
                ) {
                    const quantity =
                        Number(
                            updatedItem.quantity
                        );

                    const rate =
                        Number(updatedItem.rate);

                    if (
                        updatedItem.quantity !== '' &&
                        updatedItem.rate !== '' &&
                        Number.isFinite(quantity) &&
                        Number.isFinite(rate)
                    ) {
                        updatedItem.amount = (
                            quantity * rate
                        ).toFixed(2);
                    }
                }

                return updatedItem;
            })
        );

        setSaveMessage('');
        setSaveSucceeded(false);
    }

    function handleAddItem() {
        setItems((currentItems) => [
            ...currentItems,
            createEmptyItem(),
        ]);

        setSaveMessage('');
        setSaveSucceeded(false);
    }

    function handleRemoveItem(
        id: string
    ) {
        setItems((currentItems) => {
            if (currentItems.length === 1) {
                return currentItems;
            }

            return currentItems.filter(
                (item) => item.id !== id
            );
        });

        setSaveMessage('');
        setSaveSucceeded(false);
    }

    async function handleSave() {
        try {
            setSaving(true);
            setSaveMessage('');
            setSaveSucceeded(false);

            const result = await saveInvoice({
                referenceMonth:
                    initialData.referenceMonth,

                invoiceDate:
                    initialData.date,

                taxPercentage:
                    parsedTaxPercentage,

                items: items.map((item) => ({
                    description:
                        item.description,

                    link:
                        item.link.trim()
                            ? item.link.trim()
                            : null,

                    quantity:
                        parseOptionalNumber(
                            item.quantity
                        ),

                    rate:
                        parseOptionalNumber(
                            item.rate
                        ),

                    amount:
                        parseOptionalNumber(
                            item.amount
                        ),

                    source: item.source,
                })),
            });

            if (!result.success) {
                setSaveMessage(
                    result.message
                );

                return;
            }

            setInvoiceNumber(
                String(
                    result.invoiceNumber
                )
            );

            setSaveMessage(
                'Invoice saved successfully.'
            );

            setSaveSucceeded(true);

            /*
             * Faz o Server Component buscar novamente
             * a invoice persistida.
             */
            router.refresh();
        } catch (error) {
            console.error(
                'Error saving invoice:',
                error
            );

            setSaveMessage(
                'The invoice could not be saved.'
            );
        } finally {
            setSaving(false);
        }
    }

    function handlePrint() {
        window.print();
    }

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* EDITOR */}
                <section className="mb-14 print:hidden">
                    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Invoice Generator
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Review the monthly total and add any additional invoice items.
                            </p>

                            {saveMessage && (
                                <p
                                    role="status"
                                    className={`mt-3 text-sm font-medium ${saveSucceeded
                                        ? 'text-emerald-700'
                                        : 'text-red-600'
                                        }`}
                                >
                                    {saveMessage}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  border
                  border-black
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-black
                  transition-colors
                  hover:bg-slate-100
                  disabled:cursor-wait
                  disabled:opacity-60
                "
                            >
                                <Save size={17} />

                                {saving
                                    ? 'Saving...'
                                    : 'Save invoice'}
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  bg-black
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition-opacity
                  hover:opacity-80
                "
                            >
                                <Printer size={17} />

                                Print invoice
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-200 bg-slate-50 p-4 md:p-6">
                        {items.map((item) => (
                            <InvoiceItemRow
                                key={item.id}
                                item={item}
                                onChange={
                                    handleItemChange
                                }
                                onRemove={
                                    handleRemoveItem
                                }
                                canRemove={
                                    items.length > 1
                                }
                            />
                        ))}

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="
                mt-6
                inline-flex
                items-center
                gap-2
                border
                border-slate-300
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-slate-700
                transition-colors
                hover:border-slate-500
                hover:text-slate-900
              "
                        >
                            <Plus size={17} />

                            Add item
                        </button>
                    </div>
                </section>

                {/* DOCUMENTO DA INVOICE */}
                <section id="invoice-document">
                    <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-4">
                            <Logo />
                        </div>

                        <div className="text-left md:text-right">
                            <Title>
                                Invoice
                            </Title>

                            <span className="mt-1 block text-slate-500">
                                # {invoiceNumber}
                            </span>
                        </div>
                    </div>

                    {/* BILL TO E DATA */}
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row">
                        <div>
                            <span className="mb-2 block text-sm font-semibold text-slate-600">
                                Bill To:
                            </span>

                            <div className="space-y-0.5 text-slate-800">
                                <p className="font-bold">
                                    {
                                        initialData.billTo
                                            .name
                                    }
                                </p>

                                <p className="text-sm">
                                    {
                                        initialData.billTo
                                            .company
                                    }
                                </p>

                                <p className="text-sm">
                                    {
                                        initialData.billTo
                                            .address
                                    }
                                </p>

                                <p className="text-sm">
                                    {
                                        initialData.billTo
                                            .suite
                                    }
                                </p>

                                <p className="text-sm">
                                    {
                                        initialData.billTo
                                            .cityStateZip
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-end gap-2 md:w-auto md:text-right">
                            <div className="flex gap-4 text-sm">
                                <span className="font-medium text-slate-600">
                                    Date:
                                </span>

                                <span className="font-semibold text-slate-800">
                                    {formatInvoiceDate(
                                        initialData.date
                                    )}
                                </span>
                            </div>

                            <div className="flex w-full items-center justify-between gap-12 rounded bg-slate-100/80 px-2 py-2 md:w-auto md:justify-end md:px-6">
                                <span className="text-sm font-bold text-nowrap text-slate-700">
                                    Balance Due:
                                </span>

                                <span className="text-xl font-bold text-nowrap text-slate-900">
                                    {formatCurrency(
                                        total
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TABELA DA INVOICE */}
                    <div className="mb-8 overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-black text-sm font-medium text-white">
                                    <th className="rounded-l p-3">
                                        Item
                                    </th>

                                    <th className="p-3 text-right">
                                        Quantity
                                    </th>

                                    <th className="p-3 text-right">
                                        Rate
                                    </th>

                                    <th className="rounded-r p-3 text-right">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="text-sm text-slate-700">
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-slate-100"
                                    >
                                        <td className="max-w-xs p-3 align-top md:max-w-none">
                                            <p className="font-bold text-slate-800">
                                                {item.description ||
                                                    'Untitled item'}
                                            </p>

                                            {item.link && (
                                                <a
                                                    href={
                                                        item.link.startsWith(
                                                            'http'
                                                        )
                                                            ? item.link
                                                            : `https://${item.link}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-slate-600 hover:underline"
                                                >
                                                    {item.link}
                                                </a>
                                            )}
                                        </td>

                                        <td className="p-3 text-right align-top font-medium text-nowrap text-slate-600">
                                            {formatOptionalNumber(
                                                item.quantity
                                            )}
                                        </td>

                                        <td className="p-3 text-right align-top font-medium text-nowrap text-slate-600">
                                            {item.rate.trim()
                                                ? formatCurrency(
                                                    parseNumber(
                                                        item.rate
                                                    )
                                                )
                                                : '-'}
                                        </td>

                                        <td className="p-3 text-right align-top font-semibold text-nowrap text-slate-800">
                                            {formatCurrency(
                                                parseNumber(
                                                    item.amount
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAIS */}
                    <div className="flex justify-end">
                        <div className="w-full space-y-3 text-sm text-slate-600 md:w-72">
                            <div className="flex items-center justify-between px-4">
                                <span>
                                    Subtotal:
                                </span>

                                <span className="font-medium text-slate-800">
                                    {formatCurrency(
                                        subtotal
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 px-4">
                                <div className="flex items-center gap-2">
                                    <span>Tax</span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            taxPercentage
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setTaxPercentage(
                                                event.target
                                                    .value
                                            );

                                            setSaveMessage(
                                                ''
                                            );

                                            setSaveSucceeded(
                                                false
                                            );
                                        }}
                                        aria-label="Tax percentage"
                                        className="
                      w-16
                      border
                      border-slate-200
                      px-2
                      py-1
                      text-right
                      outline-none
                      focus:border-slate-500
                      print:hidden
                    "
                                    />

                                    <span className="print:hidden">
                                        %
                                    </span>

                                    <span className="hidden print:inline">
                                        (
                                        {
                                            parsedTaxPercentage
                                        }
                                        %)
                                    </span>
                                </div>

                                <span className="font-medium text-slate-800">
                                    {formatCurrency(
                                        taxAmount
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 px-4 pt-3 text-base font-bold text-slate-900">
                                <span>
                                    Total:
                                </span>

                                <span>
                                    {formatCurrency(
                                        total
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}