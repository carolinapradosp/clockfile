// app/(dashboard)/dashboard/page.tsx

import Link from 'next/link';

import {
    ArrowRight,
    BriefcaseBusiness,
    Clock3,
    FilePlus2,
    FileText,
    Plus,
} from 'lucide-react';

import {
    requireCurrentUser,
} from '@/lib/auth/current-user';

const summaryCards = [
    {
        label: 'Projetos ativos',
        value: '0',
        icon: BriefcaseBusiness,
    },
    {
        label: 'Horas no mês',
        value: '00:00',
        icon: Clock3,
    },
    {
        label: 'Faturas em aberto',
        value: '0',
        icon: FileText,
    },
    {
        label: 'Valor a receber',
        value: '$ 0.00',
        icon: FilePlus2,
    },
];

const quickActions = [
    {
        label: 'Criar projeto',
        description:
            'Cadastre um novo projeto para começar a registrar horas.',
        href: '/projetos/novo',
        icon: BriefcaseBusiness,
    },
    {
        label: 'Registrar horas',
        description:
            'Adicione uma atividade realizada em um dos seus projetos.',
        href: '/relatorios/novo',
        icon: Clock3,
    },
    {
        label: 'Criar fatura',
        description:
            'Importe horas registradas ou adicione itens manualmente.',
        href: '/faturas/nova',
        icon: FileText,
    },
];

function getFirstName(
    fullName: string
): string {
    return (
        fullName
            .trim()
            .split(/\s+/)[0] ||
        fullName
    );
}

export default async function DashboardPage() {
    const user =
        await requireCurrentUser();

    const firstName =
        getFirstName(user.name);

    return (
        <div>
            <header className="mb-8">
                <p className="text-sm font-medium text-blue-600">
                    Visão geral
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    Olá, {firstName}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Acompanhe seus projetos, horas trabalhadas e faturas.
                </p>
            </header>

            <section
                aria-label="Resumo"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.label}
                                    </p>

                                    <p className="mt-3 text-2xl font-bold text-slate-900">
                                        {card.value}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Icon size={21} />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="mt-8">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Ações rápidas
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Acesse as principais funcionalidades do Clockfile.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                        <Icon size={21} />
                                    </div>

                                    <ArrowRight
                                        size={18}
                                        className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                                    />
                                </div>

                                <h3 className="mt-5 font-bold text-slate-900">
                                    {action.label}
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    {action.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Atividade recente
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Seus lançamentos e faturas mais recentes aparecerão aqui.
                        </p>
                    </div>

                    <Link
                        href="/projetos/novo"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus size={16} />

                        Novo projeto
                    </Link>
                </div>

                <div className="mt-6 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">
                            Nenhuma atividade registrada ainda.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Comece criando um projeto.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}