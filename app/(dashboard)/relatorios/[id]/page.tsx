import { Suspense } from 'react';

import ReportDetailsContent from '@/components/reports/ReportDetailsContent';
import ReportDetailsSkeleton from '@/components/reports/ReportDetailsSkeleton';

type ReportEntryDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ReportEntryDetailsPage({
    params,
}: ReportEntryDetailsPageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<ReportDetailsSkeleton />}>
            <ReportDetailsContent reportId={id} />
        </Suspense>
    );
}