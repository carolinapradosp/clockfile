// app/(dashboard)/clientes/[id]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
    ArrowLeft,
    Building2,
    Edit3,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';

import { getClientById } from '@/app/actions/clients';
import ArchiveClientButton from '@/components/clients/ArchiveClientButton';
import { getProjects } from '@/app/actions/projects';

type ClientDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

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

function buildAddress(
    values: Array<string | null>
) {
    return values
        .filter(Boolean)
        .join(', ');
}

export default async function ClientDetailsPage({
    params,
}: ClientDetailsPageProps) {
    const { id } = await params;

    const [client, projects] =
        await Promise.all([
            getClientById(id),
            getProjects({
                clientId: id,
            }),
        ]);

    if (!client) {
        notFound();
    }

    const status =
        STATUS_CONFIG[client.status];

    const address = buildAddress([
        client.addressLine1,
        client.addressLine2,
        client.city,
        client.state,
        client.postalCode,
        client.countryCode,
    ]);

    return (
        <div>
            <Link
                href="/clientes"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para clientes
            </Link>

            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {client.name}
                        </h1>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                            {status.label}
                        </span>
                    </div>

                    {client.companyName && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <Building2 size={16} />

                            {client.companyName}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    {client.status !== 'archived' && (
                        <>
                            <Link
                                href={`/clientes/${client.id}/editar`}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                            >
                                <Edit3 size={17} />

                                Editar
                            </Link>

                            <ArchiveClientButton
                                clientId={client.id}
                                clientName={client.name}
                            />
                        </>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900">
                        Informações do cliente
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                E-mail
                            </p>

                            {client.email ? (
                                <a
                                    href={`mailto:${client.email}`}
                                    className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                                >
                                    <Mail size={16} />

                                    {client.email}
                                </a>
                            ) : (
                                <p className="mt-2 text-sm text-slate-400">
                                    Não informado
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Telefone
                            </p>

                            {client.phone ? (
                                <a
                                    href={`tel:${client.phone}`}
                                    className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                                >
                                    <Phone size={16} />

                                    {client.phone}
                                </a>
                            ) : (
                                <p className="mt-2 text-sm text-slate-400">
                                    Não informado
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Endereço
                            </p>

                            {address ? (
                                <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                                    <MapPin
                                        size={16}
                                        className="mt-0.5 shrink-0"
                                    />

                                    {address}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-slate-400">
                                    Não informado
                                </p>
                            )}
                        </div>
                    </div>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-900">
                            Projetos
                        </h2>

                        <Link
                            href={`/projetos/novo?clientId=${client.id}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Novo projeto
                        </Link>
                    </div>

                    {projects.length === 0 ? (
                        <div className="mt-6 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-5 text-center">
                            <p className="text-sm text-slate-500">
                                Nenhum projeto vinculado.
                            </p>

                            <Link
                                href={`/projetos/novo?clientId=${client.id}`}
                                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                            >
                                Criar projeto
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projetos/${project.id}`}
                                    className="block rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {project.name}
                                            </p>

                                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                                                {project.status}
                                            </p>
                                        </div>

                                        <span className="text-sm text-slate-400">
                                            →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <h2 className="text-lg font-bold text-slate-900">
                        Observações
                    </h2>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                        {client.notes ||
                            'Nenhuma observação cadastrada.'}
                    </p>
                </section>
            </div>
        </div>
    );
}