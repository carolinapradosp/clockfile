// components/reports/ReportEntriesTable.tsx

import Link from 'next/link';
import {
    BriefcaseBusiness,
    Edit3,
} from 'lucide-react';

import DeleteReportEntryButton from '@/components/reports/DeleteReportEntryButton';

import type {
    ReportEntry,
} from '@/interfaces/ReportEntry';

type ReportEntriesTableProps = {
    entries: ReportEntry[];
};

function formatDate(value: string) {
    return new Date(
        `${value}T00:00:00Z`
    ).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
    });
}

function formatCurrency({
    value,
    currency,
}: {
    value: number;
    currency: string;
}) {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(value);
    } catch {
        return `${currency} ${value.toFixed(2)}`;
    }
}

export default function ReportEntriesTable({
    entries,
}: ReportEntriesTableProps) {
    if (entries.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <BriefcaseBusiness
                    size={27}
                    className="text-slate-400"
                />

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                    Nenhum lançamento encontrado
                </h2>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Não existem atividades registradas para os filtros selecionados.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Tabela desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-4">
                                    Data
                                </th>

                                <th className="px-5 py-4">
                                    Projeto
                                </th>

                                <th className="px-5 py-4">
                                    Atividade
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Duração
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Rate
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Valor
                                </th>

                                <th className="w-24 px-5 py-4 text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {entries.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="border-b border-slate-100 last:border-b-0"
                                >
                                    <td className="px-5 py-4 align-top text-sm font-medium text-slate-700">
                                        {formatDate(entry.date)}
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        {entry.projectId ? (
                                            <Link
                                                href={`/projetos/${entry.projectId}`}
                                                className="text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600"
                                            >
                                                {entry.projectName}
                                            </Link>
                                        ) : (
                                            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                                                Registro legado
                                            </span>
                                        )}

                                        {(entry.clientCompanyName ||
                                            entry.clientName) && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {entry.clientCompanyName ??
                                                        entry.clientName}
                                                </p>
                                            )}
                                    </td>

                                    <td className="max-w-md px-5 py-4 align-top">
                                        <Link
                                            href={`/relatorios/${entry.id}`}
                                            className="text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600"
                                        >
                                            {entry.task}
                                        </Link>

                                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                            {entry.description}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-right align-top text-sm font-medium text-slate-700">
                                        {entry.duration}
                                    </td>

                                    <td className="px-5 py-4 text-right align-top text-sm text-slate-500">
                                        {entry.rate !== null
                                            ? formatCurrency({
                                                value: entry.rate,
                                                currency:
                                                    entry.currency,
                                            })
                                            : '—'}
                                    </td>

                                    <td className="px-5 py-4 text-right align-top text-sm font-bold text-slate-800">
                                        {formatCurrency({
                                            value: entry.amount,
                                            currency: entry.currency,
                                        })}
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={`/relatorios/${entry.id}/editar`}
                                                title="Editar lançamento"
                                                aria-label={`Editar ${entry.task}`}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Edit3 size={16} />
                                            </Link>

                                            <DeleteReportEntryButton
                                                entryId={entry.id}
                                                task={entry.task}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cards mobile */}
            <div className="space-y-4 lg:hidden">
                {entries.map((entry) => (
                    <article
                        key={entry.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {formatDate(entry.date)}
                                </p>

                                <h2 className="mt-2 font-bold text-slate-900">
                                    {entry.task}
                                </h2>
                            </div>

                            <div className="flex gap-1">
                                <Link
                                    href={`/relatorios/${entry.id}/editar`}
                                    aria-label={`Editar ${entry.task}`}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Edit3 size={16} />
                                </Link>

                                <DeleteReportEntryButton
                                    entryId={entry.id}
                                    task={entry.task}
                                />
                            </div>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-slate-500">
                            {entry.description}
                        </p>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                            {entry.projectId ? (
                                <Link
                                    href={`/projetos/${entry.projectId}`}
                                    className="text-sm font-semibold text-blue-600"
                                >
                                    {entry.projectName}
                                </Link>
                            ) : (
                                <span className="text-xs font-semibold text-amber-700">
                                    Registro legado sem projeto
                                </span>
                            )}

                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Duração
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {entry.duration}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Rate
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {entry.rate !== null
                                            ? formatCurrency({
                                                value: entry.rate,
                                                currency:
                                                    entry.currency,
                                            })
                                            : '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Valor
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {formatCurrency({
                                            value: entry.amount,
                                            currency: entry.currency,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}