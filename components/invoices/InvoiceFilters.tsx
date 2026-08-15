// components/invoices/InvoiceFilters.tsx

'use client';

import { Filter, RotateCcw } from 'lucide-react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { InvoiceProjectOption, InvoiceStatus } from '@/interfaces/Invoice';
import { inputClassNameNoIcon } from '@/lib/utils';

type InvoiceFiltersProps = {
    projects: InvoiceProjectOption[];

    selectedMonth?: string;
    selectedProjectId?: string;
    selectedStatus?: InvoiceStatus;
};

export default function InvoiceFilters({
    projects,
    selectedMonth,
    selectedProjectId,
    selectedStatus,
}: InvoiceFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();

    const searchParams = useSearchParams();

    function updateFilter(name: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        const query = params.toString();

        router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
        });
    }

    function resetFilters() {
        router.replace(pathname, {
            scroll: false,
        });
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Filter size={18} />
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label
                            htmlFor="invoice-month"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            Mês
                        </label>

                        <input
                            id="invoice-month"
                            type="month"
                            value={selectedMonth ?? ''}
                            onChange={(event) => updateFilter('month', event.target.value)}
                            className={inputClassNameNoIcon}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="invoice-project"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            Projeto
                        </label>

                        <select
                            id="invoice-project"
                            value={selectedProjectId ?? ''}
                            onChange={(event) => updateFilter('projectId', event.target.value)}
                            className={inputClassNameNoIcon}
                        >
                            <option value="">Todos os projetos</option>

                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="invoice-status"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            Status
                        </label>

                        <select
                            id="invoice-status"
                            value={selectedStatus ?? ''}
                            onChange={(event) => updateFilter('status', event.target.value)}
                            className={inputClassNameNoIcon}
                        >
                            <option value="">Todos os status</option>

                            <option value="draft">Rascunho</option>

                            <option value="issued">Emitida</option>

                            <option value="sent">Enviada</option>

                            <option value="paid">Paga</option>

                            <option value="overdue">Vencida</option>

                            <option value="cancelled">Cancelada</option>
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                    <RotateCcw size={16} />
                    Limpar
                </button>
            </div>
        </section>
    );
}
