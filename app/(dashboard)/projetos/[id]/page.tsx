// app/(dashboard)/projetos/[id]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CircleDollarSign,
    Clock3,
    Edit3,
    FileText,
} from 'lucide-react';

import { getProjectById } from '@/app/actions/projects';
import ArchiveProjectButton from '@/components/projects/ArchiveProjectButton';

type ProjectDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

const STATUS_CONFIG = {
    draft: {
        label: 'Rascunho',
        className:
            'bg-slate-100 text-slate-600',
    },

    active: {
        label: 'Ativo',
        className:
            'bg-emerald-50 text-emerald-700',
    },

    paused: {
        label: 'Pausado',
        className:
            'bg-amber-50 text-amber-700',
    },

    completed: {
        label: 'Concluído',
        className:
            'bg-blue-50 text-blue-700',
    },

    archived: {
        label: 'Arquivado',
        className:
            'bg-slate-100 text-slate-500',
    },
} as const;

function formatDate(
    value: string | null
) {
    if (!value) {
        return 'Não informado';
    }

    return new Date(
        `${value}T00:00:00Z`
    ).toLocaleDateString(
        'pt-BR',
        {
            timeZone: 'UTC',
        }
    );
}

function formatCurrency({
    value,
    currency,
}: {
    value: number;
    currency: string;
}) {
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

export default async function ProjectDetailsPage({
    params,
}: ProjectDetailsPageProps) {
    const { id } = await params;

    const project =
        await getProjectById(id);

    if (!project) {
        notFound();
    }

    const status =
        STATUS_CONFIG[project.status];

    return (
        <div>
            <Link
                href="/projetos"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para projetos
            </Link>

            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {project.name}
                        </h1>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                            {status.label}
                        </span>
                    </div>

                    <Link
                        href={`/clientes/${project.clientId}`}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
                    >
                        <Building2 size={16} />

                        {project.clientCompanyName ??
                            project.clientName}
                    </Link>
                </div>

                <div className="flex flex-wrap gap-3">
                    {project.status !==
                        'archived' && (
                            <>
                                <Link
                                    href={`/projetos/${project.id}/editar`}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                    <Edit3 size={17} />

                                    Editar
                                </Link>

                                <ArchiveProjectButton
                                    projectId={
                                        project.id
                                    }
                                    projectName={
                                        project.name
                                    }
                                />
                            </>
                        )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900">
                        Informações do projeto
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Valor por hora
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CircleDollarSign
                                    size={16}
                                />

                                {project.defaultHourlyRate !==
                                    null
                                    ? `${formatCurrency({
                                        value:
                                            project.defaultHourlyRate,
                                        currency:
                                            project.currency,
                                    })} / hora`
                                    : 'Não definido'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Moeda
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {project.currency}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Data de início
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CalendarDays
                                    size={16}
                                />

                                {formatDate(
                                    project.startDate
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Data final
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CalendarDays
                                    size={16}
                                />

                                {formatDate(
                                    project.endDate
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 border-t border-slate-100 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Descrição
                        </p>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                            {project.description ||
                                'Nenhuma descrição cadastrada.'}
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Clock3 size={21} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            Horas registradas
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Os lançamentos deste projeto serão exibidos aqui.
                        </p>

                        <p className="mt-5 text-2xl font-bold text-slate-900">
                            00:00
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FileText size={21} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            Faturamento
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            As faturas vinculadas ao projeto serão exibidas aqui.
                        </p>

                        <p className="mt-5 text-2xl font-bold text-slate-900">
                            {formatCurrency({
                                value: 0,
                                currency:
                                    project.currency,
                            })}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}