// app/(dashboard)/clientes/page.tsx

import Link from 'next/link';
import {
    Building2,
    Mail,
    Plus,
    UserRound,
} from 'lucide-react';

import { getClients } from '@/app/actions/clients';

const STATUS_CONFIG = {
    active: {
        label: 'Ativo',
        className:
            'bg-emerald-50 text-emerald-700',
    },

    inactive: {
        label: 'Inativo',
        className:
            'bg-amber-50 text-amber-700',
    },

    archived: {
        label: 'Arquivado',
        className:
            'bg-slate-100 text-slate-600',
    },
} as const;

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div>
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Clientes
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Gerencie clientes e empresas atendidas.
                    </p>
                </div>

                <Link
                    href="/clientes/novo"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={18} />

                    Novo cliente
                </Link>
            </header>

            {clients.length === 0 ? (
                <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <UserRound size={25} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                        Nenhum cliente cadastrado
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                        Cadastre seu primeiro cliente para começar a criar projetos, registrar horas e emitir faturas.
                    </p>

                    <Link
                        href="/clientes/novo"
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={17} />

                        Cadastrar cliente
                    </Link>
                </section>
            ) : (
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {clients.map((client) => {
                        const status =
                            STATUS_CONFIG[client.status];

                        return (
                            <Link
                                key={client.id}
                                href={`/clientes/${client.id}`}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                        {client.companyName ? (
                                            <Building2 size={21} />
                                        ) : (
                                            <UserRound size={21} />
                                        )}
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {client.name}
                                    </h2>

                                    {client.companyName && (
                                        <p className="mt-1 text-sm text-slate-500">
                                            {client.companyName}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 border-t border-slate-100 pt-4">
                                    {client.email ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Mail
                                                size={15}
                                                className="shrink-0"
                                            />

                                            <span className="truncate">
                                                {client.email}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">
                                            E-mail não informado
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </section>
            )}
        </div>
    );
}