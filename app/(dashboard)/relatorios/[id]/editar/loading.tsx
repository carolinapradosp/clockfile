import Skeleton from '@/components/ui/Skeleton';
import ReportFormSkeleton from '@/components/reports/ReportFormSkeleton';

export default function EditReportLoading() {
    return (
        <div className="mx-auto max-w-4xl">
            <Skeleton className="mb-6 h-5 w-44" />

            <header className="mb-8">
                <Skeleton className="h-9 w-52" />

                <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            </header>

            <ReportFormSkeleton />
        </div>
    );
}
