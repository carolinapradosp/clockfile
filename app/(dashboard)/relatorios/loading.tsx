import Skeleton from '@/components/ui/Skeleton';

function SummaryCardSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-4 h-7 w-24" />
                </div>

                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            </div>
        </article>
    );
}

function ReportRowSkeleton() {
    return (
        <div className="grid grid-cols-[90px_150px_minmax(220px,1fr)_80px_100px_100px_80px] items-start gap-5 border-t border-slate-100 px-5 py-5">
            <Skeleton className="h-4 w-20" />

            <Skeleton className="h-4 w-32" />

            <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-4 w-44" />
            </div>

            <Skeleton className="ml-auto h-4 w-12" />

            <Skeleton className="ml-auto h-4 w-20" />

            <Skeleton className="ml-auto h-4 w-20" />

            <div className="flex justify-end gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
        </div>
    );
}

function MobileReportSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="mt-2 h-4 w-36" />
                </div>

                <Skeleton className="h-4 w-20" />
            </div>

            <div className="mt-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-4 w-48 max-w-full" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="mt-2 h-4 w-10" />
                </div>

                <div>
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="mt-2 h-4 w-16" />
                </div>

                <div>
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="mt-2 h-4 w-16" />
                </div>
            </div>
        </article>
    );
}

export default function ReportsLoading() {
    return (
        <div
            aria-busy="true"
            aria-label="Carregando relatórios"
        >
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <Skeleton className="h-9 w-40" />

                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Skeleton className="h-12 w-full rounded-xl sm:w-32" />

                    <Skeleton className="h-12 w-full rounded-xl sm:w-44" />
                </div>
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[44px_1fr_1fr_auto] lg:items-end">
                    <Skeleton className="h-11 w-11 rounded-xl" />

                    <div>
                        <Skeleton className="mb-2 h-3 w-8" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="mb-2 h-3 w-14" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <Skeleton className="h-12 w-full rounded-xl lg:w-28" />
                </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <SummaryCardSkeleton key={index} />
                ))}
            </section>

            <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
                <div className="grid grid-cols-[90px_150px_minmax(220px,1fr)_80px_100px_100px_80px] gap-5 bg-slate-50 px-5 py-4">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="ml-auto h-3 w-14" />
                    <Skeleton className="ml-auto h-3 w-10" />
                    <Skeleton className="ml-auto h-3 w-12" />
                    <Skeleton className="ml-auto h-3 w-12" />
                </div>

                {Array.from({ length: 6 }).map((_, index) => (
                    <ReportRowSkeleton key={index} />
                ))}
            </section>

            <section className="space-y-4 lg:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                    <MobileReportSkeleton key={index} />
                ))}
            </section>
        </div>
    );
}