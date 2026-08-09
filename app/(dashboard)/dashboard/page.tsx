// app/(dashboard)/dashboard/page.tsx

import Link from 'next/link';

import {
    ArrowRight,
    BriefcaseBusiness,
    Clock3,
    FilePlus2,
    FileText,
    Plus,
    ReceiptText,
} from 'lucide-react';

import {
    getDashboardData,
} from '@/app/actions/dashboard';

import {
    requireCurrentUser,
} from '@/lib/auth/current-user';

import type {
    DashboardCurrencyTotal,
    DashboardRecentActivity,
} from '@/interfaces/Dashboard';
import formatCurrency, { formatDate } from '@/lib/utils';

const quickActions = [
    {
        label: 'Criar projeto',

        description:
            'Cadastre um novo projeto para começar a registrar horas.',

        href: '/projetos/novo',

        icon:
            BriefcaseBusiness,
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

        href: '/faturas/novo',

        icon: FileText,
    },
];

const invoiceStatusLabels = {
    draft: 'Rascunho',
    issued: 'Emitida',
    sent: 'Enviada',
    paid: 'Paga',
    overdue: 'Vencida',
    cancelled: 'Cancelada',
};

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

function formatDuration(
    totalMinutes: number
): string {
    const safeMinutes =
        Number.isFinite(
            totalMinutes
        ) &&
            totalMinutes >= 0
            ? Math.floor(
                totalMinutes
            )
            : 0;

    const hours =
        Math.floor(
            safeMinutes / 60
        );

    const minutes =
        safeMinutes % 60;

    return `${String(
        hours
    ).padStart(
        2,
        '0'
    )}:${String(
        minutes
    ).padStart(
        2,
        '0'
    )}`;
}



function formatCurrencyTotals(
    totals:
        DashboardCurrencyTotal[]
): string[] {
    if (
        totals.length === 0
    ) {
        return ['$ 0.00'];
    }

    return totals.map(
        (total) =>
            formatCurrency({
                value:
                    total.amount,

                currency:
                    total.currency,
            })
    );
}

function RecentActivityItem({
    activity,
}: {
    activity:
    DashboardRecentActivity;
}) {
    if (
        activity.type ===
        'report-entry'
    ) {
        return (
            <Link
                href={`/relatorios/${activity.id}`}
                className="group flex items-start gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Clock3 size={18} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                        <p className="truncate text-sm font-bold text-slate-900">
                            {activity.title}
                        </p>

                        <p className="shrink-0 text-xs text-slate-400">
                            {formatDate(
                                activity.date
                            )}
                        </p>
                    </div>

                    <p className="mt-1 truncate text-sm text-slate-500">
                        {activity.projectName}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                        <span>
                            {formatDuration(
                                activity.durationMinutes
                            )}
                        </span>

                        <span>
                            {formatCurrency({
                                value:
                                    activity.amount,

                                currency:
                                    activity.currency,
                            })}
                        </span>
                    </div>
                </div>

                <ArrowRight
                    size={17}
                    className="mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                />
            </Link>
        );
    }

    const recipient =
        activity.recipientName ??
        'Destinatário não informado';

    return (
        <Link
            href={`/faturas/${activity.id}`}
            className="group flex items-start gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ReceiptText
                    size={18}
                />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <p className="truncate text-sm font-bold text-slate-900">
                        Fatura #{activity.invoiceNumber}
                    </p>

                    <p className="shrink-0 text-xs text-slate-400">
                        {formatDate(
                            activity.date
                        )}
                    </p>
                </div>

                <p className="mt-1 truncate text-sm text-slate-500">
                    {recipient}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>
                        {
                            invoiceStatusLabels[
                            activity.status
                            ]
                        }
                    </span>

                    <span>
                        {formatCurrency({
                            value:
                                activity.totalAmount,

                            currency:
                                activity.currency,
                        })}
                    </span>
                </div>
            </div>

            <ArrowRight
                size={17}
                className="mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
            />
        </Link>
    );
}

export default async function DashboardPage() {
    const [
        user,
        dashboard,
    ] = await Promise.all([
        requireCurrentUser(),
        getDashboardData(),
    ]);

    const firstName =
        getFirstName(
            user.name
        );

    const receivableValues =
        formatCurrencyTotals(
            dashboard
                .openInvoices
                .totals
        );

    const generatedValues =
        formatCurrencyTotals(
            dashboard
                .currentMonth
                .generatedAmounts
        );

    const summaryCards = [
        {
            label:
                'Projetos ativos',

            values: [
                String(
                    dashboard
                        .activeProjects
                ),
            ],

            helper:
                'Projetos em andamento',

            icon:
                BriefcaseBusiness,
        },
        {
            label:
                'Horas no mês',

            values: [
                formatDuration(
                    dashboard
                        .currentMonth
                        .totalMinutes
                ),
            ],

            helper:
                `${dashboard.currentMonth.totalEntries} lançamento(s)`,

            icon: Clock3,
        },
        {
            label:
                'Faturas em aberto',

            values: [
                String(
                    dashboard
                        .openInvoices
                        .count
                ),
            ],

            helper:
                'Emitidas, enviadas ou vencidas',

            icon: FileText,
        },
        {
            label:
                'Valor a receber',

            values:
                receivableValues,

            helper:
                generatedValues.length > 0
                    ? `Gerado no mês: ${generatedValues.join(
                        ' · '
                    )}`
                    : undefined,

            icon: FilePlus2,
        },
    ];

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
                {summaryCards.map(
                    (card) => {
                        const Icon =
                            card.icon;

                        return (
                            <article
                                key={card.label}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-500">
                                            {card.label}
                                        </p>

                                        <div className="mt-3 space-y-1">
                                            {card.values.map(
                                                (
                                                    value
                                                ) => (
                                                    <p
                                                        key={
                                                            value
                                                        }
                                                        className="truncate text-2xl font-bold text-slate-900"
                                                    >
                                                        {value}
                                                    </p>
                                                )
                                            )}
                                        </div>

                                        {card.helper && (
                                            <p className="mt-2 text-xs leading-relaxed text-slate-400">
                                                {
                                                    card.helper
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon
                                            size={21}
                                        />
                                    </div>
                                </div>
                            </article>
                        );
                    }
                )}
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
                    {quickActions.map(
                        (action) => {
                            const Icon =
                                action.icon;

                            return (
                                <Link
                                    key={
                                        action.href
                                    }
                                    href={
                                        action.href
                                    }
                                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                            <Icon
                                                size={21}
                                            />
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
                                        {
                                            action.description
                                        }
                                    </p>
                                </Link>
                            );
                        }
                    )}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Atividade recente
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Seus lançamentos e faturas mais recentes.
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

                {dashboard
                    .recentActivity
                    .length === 0 ? (
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
                ) : (
                    <div className="mt-6 space-y-3">
                        {dashboard
                            .recentActivity
                            .map(
                                (
                                    activity
                                ) => (
                                    <RecentActivityItem
                                        key={`${activity.type}-${activity.id}`}
                                        activity={
                                            activity
                                        }
                                    />
                                )
                            )}
                    </div>
                )}
            </section>
        </div>
    );
}