// app/(dashboard)/projetos/novo/page.tsx

import Link from 'next/link';

import {
    ArrowLeft,
} from 'lucide-react';

import ProjectForm from '@/components/projects/ProjectForm';

export default function NewProjectPage() {
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
                    Crie um projeto para registrar horas e gerar relatórios.
                </p>
            </header>

            <ProjectForm />
        </div>
    );
}