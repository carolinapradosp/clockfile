// app/(dashboard)/dashboard/page.tsx

import {
    BriefcaseBusiness,
    Clock3,
    FileText,
    Users,
} from 'lucide-react';

const summaryCards = [
    {
        label: 'Clientes ativos',
        value: '0',
        icon: Users,
    },
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
        value: '$ 0.00',
        icon: FileText,
    },
];

export default function DashboardPage() {
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Dashboard
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Acompanhe seus clientes, projetos, horas e faturas.
                </p>
            </div>

            <section
                aria-label="Resumo"
                className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
            >
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="
                rounded-2xl border
                border-slate-200 bg-white
                p-5 shadow-sm
              "
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

                                <div
                                    className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl bg-blue-50
                    text-blue-600
                  "
                                >
                                    <Icon size={21} />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section
                className="
          mt-8 rounded-2xl
          border border-slate-200
          bg-white p-6
        "
            >
                <h3 className="text-lg font-bold text-slate-900">
                    Atividade recente
                </h3>

                <div
                    className="
            mt-6 flex min-h-48
            items-center justify-center
            rounded-xl border
            border-dashed border-slate-200
          "
                >
                    <p className="text-sm text-slate-500">
                        Nenhuma atividade registrada ainda.
                    </p>
                </div>
            </section>
        </div>
    );
}