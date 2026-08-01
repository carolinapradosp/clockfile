// components/invoices/InvoiceFilters.tsx

'use client';

import {
    Filter,
    RotateCcw,
} from 'lucide-react';

import {
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation';

import type {
    InvoiceClientOption,
    InvoiceProjectOption,
    InvoiceStatus,
} from '@/interfaces/Invoice';

type InvoiceFiltersProps = {
    clients: InvoiceClientOption[];
    projects: InvoiceProjectOption[];

    selectedMonth?: string;
    selectedClientId?: string;
    selectedProjectId?: string;
    selectedStatus?: InvoiceStatus;
};

const inputClassName = `
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  text-sm
  text-slate-700
  outline-none
  transition-all
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;

export default function InvoiceFilters({
    clients,
    projects,
    selectedMonth,
    selectedClientId,
    selectedProjectId,
    selectedStatus,
}: InvoiceFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams =
        useSearchParams();

    const filteredProjects =
        selectedClientId
            ? projects.filter(
                (project) =>
                    project.clientId ===
                    selectedClientId
            )
            : projects;

    function updateFilter(
        name: string,
        value: string
    ) {
        const params =
            new URLSearchParams(
                searchParams.toString()
            );

        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        if (name === 'clientId') {
            params.delete('projectId');
        }

        const query =
            params.toString();

        router.replace(
            query
                ? `${pathname}?${query}`
                : pathname,
            {
                scroll: false,
            }
        );
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

                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                            value={
                                selectedMonth ?? ''
                            }
                            onChange={(event) =>
                                updateFilter(
                                    'month',
                                    event.target.value
                                )
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="invoice-client"
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            Cliente
                        </label>

                        <select
                            id="invoice-client"
                            value={
                                selectedClientId ?? ''
                            }
                            onChange={(event) =>
                                updateFilter(
                                    'clientId',
                                    event.target.value
                                )
                            }
                            className={inputClassName}
                        >
                            <option value="">
                                Todos os clientes
                            </option>

                            {clients.map((client) => (
                                <option
                                    key={client.id}
                                    value={client.id}
                                >
                                    {client.companyName
                                        ? `${client.companyName} — ${client.name}`
                                        : client.name}
                                </option>
                            ))}
                        </select>
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
                            value={
                                selectedProjectId ?? ''
                            }
                            onChange={(event) =>
                                updateFilter(
                                    'projectId',
                                    event.target.value
                                )
                            }
                            className={inputClassName}
                        >
                            <option value="">
                                Todos os projetos
                            </option>

                            {filteredProjects.map(
                                (project) => (
                                    <option
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.clientCompanyName
                                            ? `${project.clientCompanyName} — ${project.name}`
                                            : `${project.clientName} — ${project.name}`}
                                    </option>
                                )
                            )}
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
                            value={
                                selectedStatus ?? ''
                            }
                            onChange={(event) =>
                                updateFilter(
                                    'status',
                                    event.target.value
                                )
                            }
                            className={inputClassName}
                        >
                            <option value="">
                                Todos os status
                            </option>

                            <option value="draft">
                                Rascunho
                            </option>

                            <option value="issued">
                                Emitida
                            </option>

                            <option value="sent">
                                Enviada
                            </option>

                            <option value="paid">
                                Paga
                            </option>

                            <option value="overdue">
                                Vencida
                            </option>

                            <option value="cancelled">
                                Cancelada
                            </option>
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