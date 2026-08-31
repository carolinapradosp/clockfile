import Skeleton from '@/components/ui/Skeleton';

function SummaryCardSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-8 w-24" />
                </div>

                <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
        </article>
    );
}

function InformationItemSkeleton() {
    return (
        <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-4 w-36" />
        </div>
    );
}

function QuickAccessSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="mt-5 h-6 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
        </article>
    );
}

export default function ProjectDetailsSkeleton() {
    return (
        <div aria-busy="true" aria-label="Carregando projeto">
            <Skeleton className="mb-6 h-5 w-36" />

            <header className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-9 w-64 max-w-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-11 w-40 rounded-xl" />
                    <Skeleton className="h-11 w-24 rounded-xl" />
                    <Skeleton className="h-11 w-28 rounded-xl" />
                    <Skeleton className="h-11 w-24 rounded-xl" />
                </div>
            </header>

            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />

                <div className="sm:col-span-2 xl:col-span-1">
                    <SummaryCardSkeleton />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <Skeleton className="h-6 w-48" />

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InformationItemSkeleton />
                        <InformationItemSkeleton />
                        <InformationItemSkeleton />
                        <InformationItemSkeleton />
                    </div>

                    <div className="mt-7 border-t border-slate-100 pt-6">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="mt-4 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-5/6" />
                    </div>

                    <div className="mt-7 border-t border-slate-100 pt-6">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="mt-3 h-4 w-80 max-w-full" />

                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <InformationItemSkeleton />
                            <InformationItemSkeleton />
                            <InformationItemSkeleton />
                            <InformationItemSkeleton />
                        </div>

                        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

                                <div className="flex-1">
                                    <Skeleton className="h-3 w-40" />
                                    <Skeleton className="mt-3 h-4 w-3/4" />
                                    <Skeleton className="mt-2 h-4 w-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <QuickAccessSkeleton />
                    <QuickAccessSkeleton />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                        </div>

                        <Skeleton className="h-4 w-16" />
                    </div>

                    <div className="mt-6 divide-y divide-slate-100">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <Skeleton className="h-5 w-48 max-w-full" />
                                    <Skeleton className="mt-2 h-4 w-80 max-w-full" />
                                </div>

                                <div className="flex shrink-0 items-center gap-5">
                                    <div>
                                        <Skeleton className="h-3 w-10" />
                                        <Skeleton className="mt-2 h-4 w-20" />
                                    </div>

                                    <div>
                                        <Skeleton className="h-3 w-14" />
                                        <Skeleton className="mt-2 h-4 w-14" />
                                    </div>

                                    <div>
                                        <Skeleton className="h-3 w-10" />
                                        <Skeleton className="mt-2 h-4 w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
