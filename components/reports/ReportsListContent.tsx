import {
    CircleDollarSign,
    Clock3,
    FileClock,
} from 'lucide-react';

import {
    getReportEntries,
    getReportProjectOptions,
} from '@/app/actions/report';

import ReportEntriesTable from '@/components/reports/ReportEntriesTable';
import ReportFilters from '@/components/reports/ReportFilters';

import formatCurrency, {
    formatDuration,
} from '@/lib/utils';

type ReportsListContentProps = {
    selectedMonth: string;
    selectedProjectId?: string;
};

export default async function ReportsListContent({
    selectedMonth,
    selectedProjectId,
}: ReportsListContentProps) {
    const [entries, projects] = await Promise.all([
        getReportEntries({
            month: selectedMonth,
            projectId: selectedProjectId,
        }),

        getReportProjectOptions(),
    ]);

    const totalMinutes = entries.reduce(
        (total, entry) => total + entry.durationMinutes,
        0
    );

    const totalsByCurrency = entries.reduce<Record<string, number>>(
        (totals, entry) => {
            totals[entry.currency] =
                (totals[entry.currency] ?? 0) + entry.amount;

            return totals;
        },
        {}
    );

    const currencyEntries = Object.entries(totalsByCurrency);

    return (
        <>
            <ReportFilters
                projects={projects}
                selectedMonth={selectedMonth}
                selectedProjectId={selectedProjectId}
            />

            <section className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Lançamentos
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {entries.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileClock size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total de horas
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {formatDuration(totalMinutes)}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Clock3 size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Valor gerado
                            </p>

                            {currencyEntries.length === 0 ? (
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    $0.00
                                </p>
                            ) : (
                                <div className="mt-2 space-y-1">
                                    {currencyEntries.map(
                                        ([currency, value]) => (
                                            <p
                                                key={currency}
                                                className="text-xl font-bold text-slate-900"
                                            >
                                                {formatCurrency({
                                                    value,
                                                    currency,
                                                })}
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CircleDollarSign size={21} />
                        </div>
                    </div>
                </article>
            </section>

            <ReportEntriesTable entries={entries} />
        </>
    );
}