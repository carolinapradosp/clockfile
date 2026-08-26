import Skeleton from '@/components/ui/Skeleton';

function SummaryCardSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-28" />

                    <Skeleton className="mt-4 h-8 w-20" />

                    <Skeleton className="mt-4 h-3 w-36 max-w-full" />
                </div>

                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            </div>
        </article>
    );
}

function QuickActionSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />

                <Skeleton className="mt-1 h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-6 h-5 w-28" />

            <Skeleton className="mt-3 h-4 w-full" />

            <Skeleton className="mt-2 h-4 w-4/5" />
        </article>
    );
}

function RecentActivitySkeleton() {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-slate-100 p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <Skeleton className="h-4 w-36" />

                    <Skeleton className="h-3 w-20" />
                </div>

                <Skeleton className="mt-2 h-4 w-32" />

                <div className="mt-3 flex gap-4">
                    <Skeleton className="h-3 w-12" />

                    <Skeleton className="h-3 w-20" />
                </div>
            </div>

            <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-full" />
        </div>
    );
}

export default function DashboardLoading() {
    return (
        <div
            aria-busy="true"
            aria-label="Carregando dashboard"
        >
            <header className="mb-8">
                <Skeleton className="h-4 w-20" />

                <Skeleton className="mt-3 h-9 w-52 max-w-full" />

                <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            </header>

            <section
                aria-label="Resumo"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {Array.from({ length: 4 }).map((_, index) => (
                    <SummaryCardSkeleton key={index} />
                ))}
            </section>

            <section className="mt-8">
                <Skeleton className="h-6 w-32" />

                <Skeleton className="mt-2 h-4 w-72 max-w-full" />

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <QuickActionSkeleton key={index} />
                    ))}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Skeleton className="h-6 w-36" />

                        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                    </div>

                    <Skeleton className="h-11 w-32 rounded-xl" />
                </div>

                <div className="mt-6 space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <RecentActivitySkeleton key={index} />
                    ))}
                </div>
            </section>
        </div>
    );
}