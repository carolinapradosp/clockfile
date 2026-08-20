import type { Metadata } from 'next';

import { getReportEntries, getReportProjectOptions } from '@/app/actions/report';

import ReportDocument from '@/components/reports/ReportDocument';
import ReportDocumentActions from '@/components/reports/ReportDocumentActions';

import { requireCurrentUser } from '@/lib/auth/current-user';

import { isValidMonth } from '@/lib/utils';

type PrintReportsPageProps = {
    searchParams: Promise<{
        month?: string;
        projectId?: string;
    }>;
};

export const metadata: Metadata = {
    title: 'Imprimir relatório',
};

export default async function PrintReportsPage({ searchParams }: PrintReportsPageProps) {
    const params = await searchParams;

    const month = isValidMonth(params.month) ? params.month! : new Date().toISOString().slice(0, 7);

    const projectId = params.projectId || undefined;

    const [entries, projects, user] = await Promise.all([
        getReportEntries({
            month,
            projectId,
        }),

        getReportProjectOptions(),

        requireCurrentUser(),
    ]);

    const project = projectId ? projects.find((item) => item.id === projectId) : undefined;

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 print:p-0">
            <ReportDocumentActions month={month} projectId={projectId} />

            <ReportDocument
                entries={entries}
                user={user}
                month={month}
                projectName={project?.name}
            />
        </main>
    );
}
