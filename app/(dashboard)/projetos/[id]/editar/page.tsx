// app/(dashboard)/projetos/[id]/editar/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import {
    getProjectById,
    getProjectClientOptions,
} from '@/app/actions/projects';

import ProjectForm from '@/components/projects/ProjectForm';

type EditProjectPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditProjectPage({
    params,
}: EditProjectPageProps) {
    const { id } = await params;

    const [project, clients] =
        await Promise.all([
            getProjectById(id),
            getProjectClientOptions(),
        ]);

    if (!project) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl">
            <Link
                href={`/projetos/${project.id}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para o projeto
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Editar projeto
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Atualize os dados de {project.name}.
                </p>
            </header>

            <ProjectForm
                project={project}
                clients={clients}
            />
        </div>
    );
}