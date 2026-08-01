// app/(dashboard)/clientes/novo/page.tsx

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import ClientForm from '@/components/clients/ClientForm';

export default function NewClientPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <Link
                href="/clientes"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para clientes
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Novo cliente
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Cadastre os dados do cliente para associá-lo aos próximos projetos.
                </p>
            </header>

            <ClientForm />
        </div>
    );
}