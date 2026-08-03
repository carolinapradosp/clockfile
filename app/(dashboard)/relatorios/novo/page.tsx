// app/(dashboard)/relatorios/novo/page.tsx

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import {
    getReportProjectOptions,
} from '@/app/actions/report';

import ReportEntryForm from '@/components/reports/ReportEntryForm';

type NewReportEntryPageProps = {
    searchParams: Promise<{
        projectId?: string;
    }>;
};

export default async function NewReportEntryPage({
    searchParams,
}: NewReportEntryPageProps) {
    const params = await searchParams;

    const projects =
        await getReportProjectOptions();

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
                    Novo lançamento
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Registre uma atividade e o tempo trabalhado no projeto.
                </p>
            </header>

            <ReportEntryForm
                projects={projects}
                initialProjectId={
                    params.projectId
                }
            />
        </div>
    );
}