import Link from 'next/link';

import {
    Plus,
    Printer,
} from 'lucide-react';

import { Suspense } from 'react';

import ReportsListContent from '@/components/reports/ReportsListContent';
import ReportsListSkeleton from '@/components/reports/ReportsListSkeleton';

import { isValidMonth } from '@/lib/utils';

type ReportsPageProps = {
    searchParams: Promise<{
        month?: string;
        projectId?: string;
    }>;
};

export default async function ReportsPage({
    searchParams,
}: ReportsPageProps) {
    const params = await searchParams;

    const selectedMonth = isValidMonth(params.month)
        ? params.month!
        : new Date().toISOString().slice(0, 7);

    const selectedProjectId =
        params.projectId || undefined;

    const newEntryQuery = new URLSearchParams();

    if (selectedProjectId) {
        newEntryQuery.set(
            'projectId',
            selectedProjectId
        );
    }

    const newEntryHref =
        newEntryQuery.size > 0
            ? `/relatorios/novo?${newEntryQuery.toString()}`
            : '/relatorios/novo';

    const printQuery = new URLSearchParams();

    printQuery.set(
        'month',
        selectedMonth
    );

    if (selectedProjectId) {
        printQuery.set(
            'projectId',
            selectedProjectId
        );
    }

    const printHref =
        `/relatorios/imprimir?${printQuery.toString()}`;

    return (
        <div>
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Relatórios
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Registre atividades e acompanhe as horas trabalhadas.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href={printHref}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <Printer size={18} />
                        Imprimir
                    </Link>

                    <Link
                        href={newEntryHref}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Novo lançamento
                    </Link>
                </div>
            </header>

            <Suspense
                key={`${selectedMonth}-${selectedProjectId ?? 'all'}`}
                fallback={<ReportsListSkeleton />}
            >
                <ReportsListContent
                    selectedMonth={selectedMonth}
                    selectedProjectId={selectedProjectId}
                />
            </Suspense>
        </div>
    );
}