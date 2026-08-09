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
    FileClock,
    FileText,
    Mail,
    MapPin,
    Phone,
    Plus,
    UserRound,
} from 'lucide-react';

import {
    getProjectById,
} from '@/app/actions/projects';

import {
    getProjectReportSummary,
} from '@/app/actions/report';

import DeleteProjectButton from '@/components/projects/DeleteProjectButton';
import formatCurrency, { formatDate } from '@/lib/utils';

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



function formatDuration(
    totalMinutes: number
) {
    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes =
        totalMinutes % 60;

    return `${String(hours).padStart(
        2,
        '0'
    )}:${String(minutes).padStart(
        2,
        '0'
    )}`;
}

export default async function ProjectDetailsPage({
    params,
}: ProjectDetailsPageProps) {
    const { id } = await params;

    const [project, reportSummary] =
        await Promise.all([
            getProjectById(id),
            getProjectReportSummary(id),
        ]);

    if (!project) {
        notFound();
    }

    const status =
        STATUS_CONFIG[project.status];

    const summary = reportSummary ?? {
        entriesCount: 0,
        totalMinutes: 0,
        totalAmount: 0,
        currency: project.currency,
        recentEntries: [],
    };

    const reportListUrl =
        `/relatorios?projectId=${encodeURIComponent(
            project.id
        )}`;

    const newEntryUrl =
        `/relatorios/novo?projectId=${encodeURIComponent(
            project.id
        )}`;

    return (
        <div>
            <Link
                href="/projetos"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para projetos
            </Link>

            <header className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
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
                </div>

                <div className="flex flex-wrap gap-3">
                    {project.status !==
                        'archived' && (
                            <Link
                                href={newEntryUrl}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                <Plus size={17} />

                                Novo lançamento
                            </Link>
                        )}

                    {project.status !==
                        'archived' && (
                            <Link
                                href={`/projetos/${project.id}/editar`}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                            >
                                <Edit3 size={17} />

                                Editar
                            </Link>
                        )}

                    <DeleteProjectButton
                        projectId={project.id}
                        projectName={project.name}
                    />
                </div>
            </header>

            {/* RESUMO */}
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Lançamentos
                            </p>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                                {summary.entriesCount}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileClock size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Horas registradas
                            </p>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                                {formatDuration(
                                    summary.totalMinutes
                                )}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Clock3 size={21} />
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2 xl:col-span-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Valor gerado
                            </p>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                                {formatCurrency({
                                    value:
                                        summary.totalAmount,

                                    currency:
                                        summary.currency,
                                })}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CircleDollarSign
                                size={21}
                            />
                        </div>
                    </div>
                </article>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* INFORMAÇÕES */}
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
                                <CalendarDays size={16} />

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
                                <CalendarDays size={16} />

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


                    {/* DADOS DE FATURAMENTO */}

                    <div className="mt-7 border-t border-slate-100 pt-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Dados de faturamento
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Informações utilizadas automaticamente ao criar faturas deste projeto.
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* NOME */}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Destinatário
                                </p>

                                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <UserRound
                                        size={16}
                                        className="shrink-0 text-slate-400"
                                    />

                                    {project.billing.name ||
                                        'Não informado'}
                                </p>
                            </div>

                            {/* EMPRESA */}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Empresa
                                </p>

                                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Building2
                                        size={16}
                                        className="shrink-0 text-slate-400"
                                    />

                                    {project.billing.company ||
                                        'Não informado'}
                                </p>
                            </div>

                            {/* E-MAIL */}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    E-mail
                                </p>

                                <p className="mt-2 flex items-center gap-2 break-all text-sm font-medium text-slate-700">
                                    <Mail
                                        size={16}
                                        className="shrink-0 text-slate-400"
                                    />

                                    {project.billing.email ||
                                        'Não informado'}
                                </p>
                            </div>

                            {/* TELEFONE */}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Telefone
                                </p>

                                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Phone
                                        size={16}
                                        className="shrink-0 text-slate-400"
                                    />

                                    {project.billing.phone ||
                                        'Não informado'}
                                </p>
                            </div>
                        </div>

                        {/* ENDEREÇO */}
                        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                    <MapPin size={17} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Endereço de faturamento
                                    </p>

                                    {project.billing.addressLine1 ||
                                        project.billing.addressLine2 ||
                                        project.billing.city ||
                                        project.billing.state ||
                                        project.billing.postalCode ||
                                        project.billing.countryCode ? (
                                        <div className="mt-2 space-y-1 text-sm leading-relaxed text-slate-700">
                                            {project.billing
                                                .addressLine1 && (
                                                    <p>
                                                        {
                                                            project.billing
                                                                .addressLine1
                                                        }
                                                    </p>
                                                )}

                                            {project.billing
                                                .addressLine2 && (
                                                    <p>
                                                        {
                                                            project.billing
                                                                .addressLine2
                                                        }
                                                    </p>
                                                )}

                                            {(project.billing.city ||
                                                project.billing.state) && (
                                                    <p>
                                                        {[
                                                            project.billing
                                                                .city,
                                                            project.billing
                                                                .state,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' — ')}
                                                    </p>
                                                )}

                                            {(project.billing
                                                .postalCode ||
                                                project.billing
                                                    .countryCode) && (
                                                    <p>
                                                        {[
                                                            project.billing
                                                                .postalCode,
                                                            project.billing
                                                                .countryCode,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </p>
                                                )}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-500">
                                            Nenhum endereço de faturamento cadastrado.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ACESSOS RÁPIDOS */}
                <section className="space-y-4">
                    <Link
                        href={reportListUrl}
                        className="group block rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-sm"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                            Ver relatório
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            Consulte os lançamentos mensais vinculados a este projeto.
                        </p>
                    </Link>

                    {project.status !==
                        'archived' && (
                            <Link
                                href={newEntryUrl}
                                className="group block rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-sm"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Plus size={21} />
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                                    Registrar atividade
                                </h2>

                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    Adicione horas trabalhadas diretamente neste projeto.
                                </p>
                            </Link>
                        )}
                </section>

                {/* ÚLTIMOS LANÇAMENTOS */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Últimos lançamentos
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Atividades mais recentes registradas no projeto.
                            </p>
                        </div>

                        {summary.entriesCount > 0 && (
                            <Link
                                href={reportListUrl}
                                className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                            >
                                Ver todos
                            </Link>
                        )}
                    </div>

                    {summary.recentEntries.length ===
                        0 ? (
                        <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
                            <Clock3
                                size={24}
                                className="text-slate-400"
                            />

                            <p className="mt-4 text-sm font-medium text-slate-600">
                                Nenhuma atividade registrada.
                            </p>

                            {project.status !==
                                'archived' && (
                                    <Link
                                        href={newEntryUrl}
                                        className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
                                    >
                                        Criar primeiro lançamento
                                    </Link>
                                )}
                        </div>
                    ) : (
                        <div className="mt-6 divide-y divide-slate-100">
                            {summary.recentEntries.map(
                                (entry) => (
                                    <Link
                                        key={entry.id}
                                        href={`/relatorios/${entry.id}`}
                                        className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                                                {entry.task}
                                            </p>

                                            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                                {entry.description}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-5 text-sm">
                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Data
                                                </p>

                                                <p className="mt-1 font-medium text-slate-700">
                                                    {formatDate(
                                                        entry.date
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Duração
                                                </p>

                                                <p className="mt-1 font-medium text-slate-700">
                                                    {entry.duration}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">
                                                    Valor
                                                </p>

                                                <p className="mt-1 font-bold text-slate-900">
                                                    {formatCurrency({
                                                        value:
                                                            entry.amount,

                                                        currency:
                                                            entry.currency,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}