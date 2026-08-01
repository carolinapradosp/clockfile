// app/(dashboard)/relatorios/[id]/editar/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import {
    getReportEntryById,
    getReportProjectOptions,
} from '@/app/actions/report';

import ReportEntryForm from '@/components/reports/ReportEntryForm';

type EditReportEntryPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditReportEntryPage({
    params,
}: EditReportEntryPageProps) {
    const { id } = await params;

    const [entry, projects] =
        await Promise.all([
            getReportEntryById(id),
            getReportProjectOptions(),
        ]);

    if (!entry) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl">
            <Link
                href="/relatorios"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Voltar para relatórios
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Editar lançamento
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Atualize a atividade {entry.task}.
                </p>

                {!entry.projectId && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Este é um registro antigo. Selecione um projeto para concluir a migração do lançamento.
                    </div>
                )}
            </header>

            <ReportEntryForm
                entry={entry}
                projects={projects}
            />
        </div>
    );
}