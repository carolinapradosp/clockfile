// components/reports/ReportFilters.tsx

'use client';

import { Filter, RotateCcw } from 'lucide-react';
import {
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation';

import type {
    ReportProjectOption,
} from '@/interfaces/ReportEntry';

type ReportFiltersProps = {
    projects: ReportProjectOption[];
    selectedMonth: string;
    selectedProjectId?: string;
};

const inputClassName = `
  h-11
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

export default function ReportFilters({
    projects,
    selectedMonth,
    selectedProjectId,
}: ReportFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function updateFilter({
        name,
        value,
    }: {
        name: string;
        value: string;
    }) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        router.replace(
            `${pathname}?${params.toString()}`,
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
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Filter size={18} />
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="report-month"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Mês
                    </label>

                    <input
                        id="report-month"
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => {
                            updateFilter({
                                name: 'month',
                                value: event.target.value,
                            });
                        }}
                        className={`${inputClassName} w-full`}
                    />
                </div>

                <div>
                    <label
                        htmlFor="report-project"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Projeto
                    </label>

                    <select
                        id="report-project"
                        value={selectedProjectId ?? ''}
                        onChange={(event) => {
                            updateFilter({
                                name: 'projectId',
                                value: event.target.value,
                            });
                        }}
                        className={`${inputClassName} w-full`}
                    >
                        <option value="">
                            Todos os projetos
                        </option>

                        {projects.map((project) => (
                            <option
                                key={project.id}
                                value={project.id}
                            >
                                {project.clientCompanyName
                                    ? `${project.clientCompanyName} — ${project.name}`
                                    : `${project.clientName} — ${project.name}`}
                            </option>
                        ))}
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
    );
}