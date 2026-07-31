// components/InvoiceBuilder.tsx

'use client';

import { useMemo, useState } from 'react';
import { Plus, Printer } from 'lucide-react';

import Logo from '@/components/Logo';
import Title from '@/components/Title';
import InvoiceItemRow from '@/components/InvoiceItemRow';

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

function parseMoney(value: string): number {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

function formatOptionalNumber(value: string): string {
    if (!value.trim()) {
        return '-';
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return '-';
    }

    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export default function InvoiceBuilder({
    initialData,
}: InvoiceBuilderProps) {
    const [items, setItems] = useState<InvoiceItem[]>(
        initialData.items.length
            ? initialData.items
            : [createEmptyItem()]
    );

    const [taxPercentage, setTaxPercentage] =
        useState(String(initialData.taxPercentage));

    const subtotal = useMemo(() => {
        return items.reduce(
            (total, item) =>
                total + parseMoney(item.amount),
            0
        );
    }, [items]);

    const parsedTaxPercentage =
        parseMoney(taxPercentage);

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

                const updatedItem = {
                    ...item,
                    [field]: value,
                };

                /*
                 * Ao alterar quantity ou rate,
                 * calculamos amount automaticamente
                 * quando os dois valores existem.
                 *
                 * O amount continua editável manualmente.
                 */
                if (
                    field === 'quantity' ||
                    field === 'rate'
                ) {
                    const quantity = Number(
                        field === 'quantity'
                            ? value
                            : updatedItem.quantity
                    );

                    const rate = Number(
                        field === 'rate'
                            ? value
                            : updatedItem.rate
                    );

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
    }

    function handleAddItem() {
        setItems((currentItems) => [
            ...currentItems,
            createEmptyItem(),
        ]);
    }

    function handleRemoveItem(id: string) {
        setItems((currentItems) => {
            if (currentItems.length === 1) {
                return currentItems;
            }

            return currentItems.filter(
                (item) => item.id !== id
            );
        });
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
                                Review the monthly totals and add additional invoice items.
                            </p>
                        </div>

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

                    <div className="border border-slate-200 bg-slate-50 p-4 md:p-6">
                        {items.map((item) => (
                            <InvoiceItemRow
                                key={item.id}
                                item={item}
                                onChange={handleItemChange}
                                onRemove={handleRemoveItem}
                                canRemove={items.length > 1}
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

                {/* INVOICE */}
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
                                # {initialData.invoiceNumber}
                            </span>
                        </div>
                    </div>

                    {/* BILL TO / DATE */}
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row">
                        <div>
                            <span className="mb-2 block text-sm font-semibold text-slate-600">
                                Bill To:
                            </span>

                            <div className="space-y-0.5 text-slate-800">
                                <p className="font-bold">
                                    {initialData.billTo.name}
                                </p>

                                <p className="text-sm">
                                    {initialData.billTo.company}
                                </p>

                                <p className="text-sm">
                                    {initialData.billTo.address}
                                </p>

                                <p className="text-sm">
                                    {initialData.billTo.suite}
                                </p>

                                <p className="text-sm">
                                    {initialData.billTo.cityStateZip}
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-end gap-2 md:w-auto md:text-right">
                            <div className="flex gap-4 text-sm">
                                <span className="font-medium text-slate-600">
                                    Date:
                                </span>

                                <span className="font-semibold text-slate-800">
                                    {initialData.date}
                                </span>
                            </div>

                            <div className="flex w-full items-center justify-between gap-12 rounded bg-slate-100/80 px-2 py-2 md:w-auto md:justify-end md:px-6">
                                <span className="text-sm font-bold text-nowrap text-slate-700">
                                    Balance Due:
                                </span>

                                <span className="text-xl font-bold text-nowrap text-slate-900">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
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
                                        <td className="max-w-xs p-3 md:max-w-none">
                                            <p className="font-bold text-slate-800">
                                                {item.description ||
                                                    'Untitled item'}
                                            </p>

                                            {item.link && (
                                                <a
                                                    href={
                                                        item.link.startsWith('http')
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
                                            {item.rate
                                                ? formatCurrency(
                                                    parseMoney(item.rate)
                                                )
                                                : '-'}
                                        </td>

                                        <td className="p-3 text-right align-top font-semibold text-nowrap text-slate-800">
                                            {formatCurrency(
                                                parseMoney(item.amount)
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS */}
                    <div className="flex justify-end">
                        <div className="w-full space-y-3 text-sm text-slate-600 md:w-72">
                            <div className="flex items-center justify-between px-4">
                                <span>
                                    Subtotal:
                                </span>

                                <span className="font-medium text-slate-800">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 px-4">
                                <span className="flex items-center gap-2">
                                    Tax

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={taxPercentage}
                                        onChange={(event) =>
                                            setTaxPercentage(
                                                event.target.value
                                            )
                                        }
                                        className="
                      w-16
                      border
                      border-slate-200
                      px-2
                      py-1
                      text-right
                      outline-none
                      print:hidden
                    "
                                    />

                                    <span className="print:hidden">
                                        %
                                    </span>

                                    <span className="hidden print:inline">
                                        ({parsedTaxPercentage}%)
                                    </span>
                                </span>

                                <span className="font-medium text-slate-800">
                                    {formatCurrency(taxAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 px-4 pt-3 text-base font-bold text-slate-900">
                                <span>
                                    Total:
                                </span>

                                <span>
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}