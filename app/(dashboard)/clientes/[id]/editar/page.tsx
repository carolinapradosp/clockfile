// app/(dashboard)/clientes/[id]/editar/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { getClientById } from '@/app/actions/clients';
import ClientForm from '@/components/clients/ClientForm';

type EditClientPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditClientPage({
    params,
}: EditClientPageProps) {
    const { id } = await params;

    const client =
        await getClientById(id);

    if (!client) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl">
            <Link
                href={`/clientes/${client.id}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para o cliente
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Editar cliente
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Atualize os dados de {client.name}.
                </p>
            </header>

            <ClientForm client={client} />
        </div>
    );
}