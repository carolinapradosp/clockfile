import Image from 'next/image';

import logoPV from '@/public/logo-300.png';

import type { CurrentUser } from '@/lib/auth/current-user';

import type { ReportEntry } from '@/interfaces/ReportEntry';

import formatCurrency, { formatDuration } from '@/lib/utils';

type ReportDocumentProps = {
    entries: ReportEntry[];

    user: CurrentUser;

    month: string;

    projectName?: string;
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

export default function ReportDocument({ entries, user, month, projectName }: ReportDocumentProps) {
    const totalMinutes = entries.reduce((total, entry) => total + entry.durationMinutes, 0);

    const totalsByCurrency = entries.reduce<Record<string, number>>((totals, entry) => {
        totals[entry.currency] = (totals[entry.currency] ?? 0) + entry.amount;

        return totals;
    }, {});

    const currencyEntries = Object.entries(totalsByCurrency);

    return (
        <article className="report-document mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-6 py-8 text-slate-900 shadow-xl sm:px-10 sm:py-10 print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
            {/* CABEÇALHO */}

            <header className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-8 sm:flex-row sm:items-start">
                <div>
                    <Image
                        src={logoPV}
                        alt="Clockfile"
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
                        Report
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                        Hours Report
                    </h1>

                    <p className="mt-3 text-sm font-semibold capitalize text-slate-600">
                        {formatMonth(month)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {projectName ? `Project: ${projectName}` : 'All projects'}
                    </p>
                </div>
            </header>

            {/* RESUMO */}

            <section className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-100 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Reports
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">{entries.length}</p>
                </div>

                <div className="rounded-xl bg-slate-100 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Total hours
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {formatDuration(totalMinutes)}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-100 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Value generated
                    </p>

                    {currencyEntries.length === 0 ? (
                        <p className="mt-2 text-2xl font-bold text-slate-950">0,00</p>
                    ) : (
                        <div className="mt-2 space-y-1">
                            {currencyEntries.map(([currency, value]) => (
                                <p key={currency} className="text-xl font-bold text-slate-950">
                                    {formatCurrency({
                                        value,
                                        currency,
                                    })}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* LANÇAMENTOS */}

            <section>
                <div className="overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-950 text-xs font-semibold uppercase tracking-wide text-white">
                                <th className="px-3 py-3">Date</th>

                                <th className="px-3 py-3">Project</th>

                                <th className="px-3 py-3">Activity</th>

                                <th className="px-3 py-3 text-right">Duration</th>

                                <th className="px-3 py-3 text-right">Rate</th>

                                <th className="px-3 py-3 text-right">Value</th>
                            </tr>
                        </thead>

                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b border-slate-200">
                                    <td className="px-3 py-4 align-top text-sm text-slate-600">
                                        {formatDate(entry.date)}
                                    </td>

                                    <td className="px-3 py-4 align-top text-sm font-semibold text-slate-800">
                                        {entry.projectName}
                                    </td>

                                    <td className="px-3 py-4 align-top">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {entry.task}
                                        </p>

                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                            {entry.description}
                                        </p>
                                    </td>

                                    <td className="px-3 py-4 text-right align-top text-sm text-slate-600">
                                        {entry.duration}
                                    </td>

                                    <td className="px-3 py-4 text-right align-top text-sm text-slate-600">
                                        {entry.rate !== null
                                            ? formatCurrency({
                                                  value: entry.rate,
                                                  currency: entry.currency,
                                              })
                                            : '—'}
                                    </td>

                                    <td className="px-3 py-4 text-right align-top text-sm font-semibold text-slate-900">
                                        {formatCurrency({
                                            value: entry.amount,
                                            currency: entry.currency,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {entries.length === 0 && (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No releases found for this period.
                    </div>
                )}
            </section>
        </article>
    );
}
