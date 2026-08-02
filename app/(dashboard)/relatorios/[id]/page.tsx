// app/(dashboard)/relatorios/[id]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Clock3,
    CircleDollarSign,
    Edit3,
    FileText,
} from 'lucide-react';

import {
    getReportEntryById,
} from '@/app/actions/report';

import DeleteReportEntryButton from '@/components/reports/DeleteReportEntryButton';

type ReportEntryDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function formatDate(
    value: string
): string {
    return new Date(
        `${value}T00:00:00Z`
    ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function formatCurrency({
    value,
    currency,
}: {
    value: number;
    currency: string;
}): string {
    try {
        return new Intl.NumberFormat(
            'en-US',
            {
                style: 'currency',
                currency,
            }
        ).format(value);
    } catch {
        return `${currency} ${value.toFixed(
            2
        )}`;
    }
}

function formatDecimalHours(
    durationMinutes: number
): string {
    const decimalHours =
        durationMinutes / 60;

    return decimalHours.toLocaleString(
        'pt-BR',
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }
    );
}

export default async function ReportEntryDetailsPage({
    params,
}: ReportEntryDetailsPageProps) {
    const { id } = await params;

    const entry =
        await getReportEntryById(id);

    if (!entry) {
        notFound();
    }



    return (
        <div className="mx-auto max-w-5xl">
            <Link
                href="/relatorios"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para relatórios
            </Link>

            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {entry.task}
                        </h1>

                        {/* {!entry.projectId && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                Registro legado
                            </span>
                        )} */}
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                        Lançamento realizado em{' '}
                        {formatDate(entry.date)}.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={`/relatorios/${entry.id}/editar`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <Edit3 size={17} />

                        Editar
                    </Link>

                    <DeleteReportEntryButton
                        entryId={entry.id}
                        task={entry.task}
                        redirectAfterDelete="/relatorios"
                        variant="button"
                    />
                </div>
            </header>

            {!entry.projectId && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-800">
                        Este lançamento ainda não está vinculado a um projeto.
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-amber-700">
                        Edite o registro e selecione um projeto para concluir a migração dos dados antigos.
                    </p>

                    <Link
                        href={`/relatorios/${entry.id}/editar`}
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-amber-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
                    >
                        Vincular projeto
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Atividade realizada
                            </h2>

                            <p className="text-sm text-slate-500">
                                Informações descritivas do lançamento.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Tarefa
                        </p>

                        <p className="mt-2 text-base font-semibold text-slate-900">
                            {entry.task}
                        </p>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Descrição
                        </p>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                            {entry.description}
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <BriefcaseBusiness size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Projeto
                            </h2>

                            <p className="text-sm text-slate-500">
                                Origem do lançamento.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href={`/projetos/${entry.projectId}`}
                            className="text-base font-bold text-slate-900 transition-colors hover:text-blue-600"
                        >
                            {entry.projectName}
                        </Link>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <h2 className="text-lg font-bold text-slate-900">
                        Resumo financeiro
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Duração e valores utilizados no cálculo deste lançamento.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                                <CalendarDays size={19} />
                            </div>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Data
                            </p>

                            <p className="mt-2 text-base font-bold text-slate-900">
                                {formatDate(entry.date)}
                            </p>
                        </article>

                        <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                                <Clock3 size={19} />
                            </div>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Duração
                            </p>

                            <p className="mt-2 text-base font-bold text-slate-900">
                                {entry.duration}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {formatDecimalHours(
                                    entry.durationMinutes
                                )}{' '}
                                horas
                            </p>
                        </article>

                        <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                <CircleDollarSign
                                    size={19}
                                />
                            </div>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Rate
                            </p>

                            <p className="mt-2 text-base font-bold text-slate-900">
                                {entry.rate !== null
                                    ? formatCurrency({
                                        value: entry.rate,
                                        currency:
                                            entry.currency,
                                    })
                                    : 'Não informado'}
                            </p>

                            {entry.rate !== null && (
                                <p className="mt-1 text-xs text-slate-500">
                                    por hora
                                </p>
                            )}
                        </article>

                        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                <CircleDollarSign
                                    size={19}
                                />
                            </div>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-700/70">
                                Valor total
                            </p>

                            <p className="mt-2 text-xl font-bold text-emerald-700">
                                {formatCurrency({
                                    value: entry.amount,
                                    currency:
                                        entry.currency,
                                })}
                            </p>

                            <p className="mt-1 text-xs text-emerald-700/70">
                                {entry.currency}
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        </div>
    );
}