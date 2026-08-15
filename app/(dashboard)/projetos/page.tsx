// app/(dashboard)/projetos/page.tsx

import Link from 'next/link';
import { BriefcaseBusiness, CalendarDays, CircleDollarSign, Plus } from 'lucide-react';

import { getProjects } from '@/app/actions/projects';
import formatCurrency, { formatDate } from '@/lib/utils';

const STATUS_CONFIG = {
    draft: {
        label: 'Rascunho',
        className: 'bg-slate-100 text-slate-600',
    },

    active: {
        label: 'Ativo',
        className: 'bg-emerald-50 text-emerald-700',
    },

    paused: {
        label: 'Pausado',
        className: 'bg-amber-50 text-amber-700',
    },

    completed: {
        label: 'Concluído',
        className: 'bg-blue-50 text-blue-700',
    },

    archived: {
        label: 'Arquivado',
        className: 'bg-slate-100 text-slate-500',
    },
} as const;

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div>
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projetos</h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Gerencie seus projetos, valores e períodos de execução.
                    </p>
                </div>

                <Link
                    href="/projetos/novo"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Novo projeto
                </Link>
            </header>

            {projects.length === 0 ? (
                <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <BriefcaseBusiness size={25} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                        Nenhum projeto cadastrado
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                        Crie um projeto para começar a registrar tarefas e horas trabalhadas.
                    </p>

                    <Link
                        href="/projetos/novo"
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={17} />
                        Cadastrar projeto
                    </Link>
                </section>
            ) : (
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => {
                        const status = STATUS_CONFIG[project.status];

                        const startDate = formatDate(project.startDate);

                        let endDate = formatDate(project.endDate);

                        if (endDate === 'Não informado' && project.status === 'active') {
                            endDate = 'Em andamento';
                        }

                        if (project.status === 'completed') {
                            endDate = 'Concluído';
                        }

                        return (
                            <Link
                                key={project.id}
                                href={`/projetos/${project.id}`}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                        <BriefcaseBusiness size={21} />
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {project.name}
                                    </h2>

                                    {project.description && (
                                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                            {project.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <CircleDollarSign size={15} className="shrink-0" />

                                        {project.defaultHourlyRate !== null ? (
                                            <span>
                                                {formatCurrency({
                                                    value: project.defaultHourlyRate,
                                                    currency: project.currency,
                                                })}
                                                /hora
                                            </span>
                                        ) : (
                                            <span>Valor/hora não definido</span>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 text-sm text-slate-500">
                                        <CalendarDays size={15} className="mt-0.5 shrink-0" />

                                        <span>
                                            {startDate || endDate ? (
                                                <>
                                                    {startDate ?? 'Sem início'}
                                                    {' — '}
                                                    {endDate ?? 'Em andamento'}
                                                </>
                                            ) : (
                                                'Período não informado'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </section>
            )}
        </div>
    );
}
