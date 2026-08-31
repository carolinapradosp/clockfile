import Skeleton from '@/components/ui/Skeleton';

function InfoCardSkeleton() {
    return (
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <Skeleton className="h-10 w-10 rounded-lg" />

            <Skeleton className="mt-4 h-3 w-20" />

            <Skeleton className="mt-3 h-5 w-28" />

            <Skeleton className="mt-2 h-3 w-20" />
        </article>
    );
}

export default function ReportDetailsSkeleton() {
    return (
        <div className="mx-auto max-w-5xl" aria-busy="true" aria-label="Carregando lançamento">
            <Skeleton className="mb-6 h-5 w-40" />

            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-9 w-64 max-w-full" />

                    <Skeleton className="mt-3 h-4 w-52" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-11 w-24 rounded-xl" />

                    <Skeleton className="h-11 w-24 rounded-xl" />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

                        <div>
                            <Skeleton className="h-6 w-44" />

                            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
                        </div>
                    </div>

                    <div className="mt-7">
                        <Skeleton className="h-3 w-16" />

                        <Skeleton className="mt-3 h-5 w-44" />
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <Skeleton className="h-3 w-20" />

                        <Skeleton className="mt-4 h-4 w-full" />

                        <Skeleton className="mt-2 h-4 w-5/6" />

                        <Skeleton className="mt-2 h-4 w-2/3" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

                        <div>
                            <Skeleton className="h-6 w-20" />

                            <Skeleton className="mt-2 h-4 w-36" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Skeleton className="h-5 w-40" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <Skeleton className="h-6 w-40" />

                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoCardSkeleton />

                        <InfoCardSkeleton />

                        <InfoCardSkeleton />

                        <InfoCardSkeleton />
                    </div>
                </section>
            </div>
        </div>
    );
}
