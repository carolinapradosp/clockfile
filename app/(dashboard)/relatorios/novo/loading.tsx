import Skeleton from '@/components/ui/Skeleton';
import ReportFormSkeleton from '@/components/reports/ReportFormSkeleton';

export default function NewReportLoading() {
    return (
        <div className="mx-auto max-w-4xl">
            <Skeleton className="mb-6 h-5 w-36" />

            <header className="mb-8">
                <Skeleton className="h-9 w-56" />

                <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            </header>

            <ReportFormSkeleton />
        </div>
    );
}