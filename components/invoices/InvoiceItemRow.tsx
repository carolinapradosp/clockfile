// components/InvoiceItemRow.tsx

'use client';

import type { InvoiceItem } from '@/interfaces/Invoice';
import { Trash2 } from 'lucide-react';

type InvoiceItemRowProps = {
    item: InvoiceItem;

    onChange: (
        id: string,
        field: keyof InvoiceItem,
        value: string
    ) => void;

    onRemove: (id: string) => void;

    canRemove: boolean;
};

const inputClassName = `
  w-full
  border
  border-slate-200
  bg-white
  px-3
  py-2
  text-sm
  text-slate-800
  outline-none
  transition-colors
  placeholder:text-slate-400
  focus:border-slate-500
`;

export default function InvoiceItemRow({
    item,
    onChange,
    onRemove,
    canRemove,
}: InvoiceItemRowProps) {
    return (
        <div className="border-b border-slate-200 py-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,1fr)_120px_120px_140px_44px]">
                {/* ITEM */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Item
                    </label>

                    <input
                        type="text"
                        value={item.description}
                        onChange={(event) =>
                            onChange(
                                item.id,
                                'description',
                                event.target.value
                            )
                        }
                        placeholder="Item description"
                        className={inputClassName}
                    />

                    <input
                        type="text"
                        value={item.link}
                        onChange={(event) =>
                            onChange(
                                item.id,
                                'link',
                                event.target.value
                            )
                        }
                        placeholder="Link or project URL (optional)"
                        className={inputClassName}
                    />
                </div>

                {/* QUANTITY */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quantity
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                            onChange(
                                item.id,
                                'quantity',
                                event.target.value
                            )
                        }
                        placeholder="0"
                        className={`${inputClassName} mt-2 text-right`}
                    />
                </div>

                {/* RATE */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Rate
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(event) =>
                            onChange(
                                item.id,
                                'rate',
                                event.target.value
                            )
                        }
                        placeholder="Optional"
                        className={`${inputClassName} mt-2 text-right`}
                    />
                </div>

                {/* AMOUNT */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(event) =>
                            onChange(
                                item.id,
                                'amount',
                                event.target.value
                            )
                        }
                        placeholder="0.00"
                        className={`${inputClassName} mt-2 text-right font-semibold`}
                    />
                </div>

                {/* REMOVE */}
                <div className="flex items-end">
                    <button
                        type="button"
                        disabled={!canRemove}
                        onClick={() => onRemove(item.id)}
                        title="Remove item"
                        aria-label="Remove item"
                        className="
              flex
              h-10
              w-10
              items-center
              justify-center
              border
              border-slate-200
              text-slate-500
              transition-colors
              hover:border-red-300
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            </div>

            {item.source === 'monthly-report' && (
                <p className="mt-2 text-xs text-slate-400">
                    Suggested automatically from the selected monthly report.
                </p>
            )}
        </div>
    );
}