// app/(dashboard)/projetos/novo/page.tsx

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { getProjectClientOptions } from '@/app/actions/projects';
import ProjectForm from '@/components/projects/ProjectForm';

type NewProjectPageProps = {
    searchParams: Promise<{
        clientId?: string;
    }>;
};

export default async function NewProjectPage({
    searchParams,
}: NewProjectPageProps) {
    const params =
        await searchParams;

    const clients =
        await getProjectClientOptions();

    return (
        <div className="mx-auto max-w-4xl">
            <Link
                href="/projetos"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para projetos
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Novo projeto
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Cadastre um projeto e vincule-o a um cliente.
                </p>
            </header>

            <ProjectForm
                clients={clients}
                initialClientId={
                    params.clientId
                }
            />
        </div>
    );
}