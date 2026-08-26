import Skeleton from '@/components/ui/Skeleton';

function InfoItemSkeleton() {
    return (
        <div>
            <Skeleton className="h-3 w-20" />

            <Skeleton className="mt-3 h-5 w-32" />
        </div>
    );
}

export default function ReportDetailsLoading() {
    return (
        <div
            className="mx-auto max-w-5xl"
            aria-busy="true"
            aria-label="Carregando lançamento"
        >
            <Skeleton className="mb-6 h-5 w-40" />

            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="flex-1">
                    <Skeleton className="h-9 w-64 max-w-full" />

                    <Skeleton className="mt-3 h-4 w-52" />
                </div>

                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-11 w-24 rounded-xl" />

                    <Skeleton className="h-11 w-24 rounded-xl" />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <Skeleton className="h-6 w-48" />

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InfoItemSkeleton />

                        <InfoItemSkeleton />

                        <InfoItemSkeleton />

                        <InfoItemSkeleton />
                    </div>

                    <div className="mt-7 border-t border-slate-100 pt-6">
                        <Skeleton className="h-3 w-24" />

                        <Skeleton className="mt-4 h-4 w-full" />

                        <Skeleton className="mt-2 h-4 w-5/6" />

                        <Skeleton className="mt-2 h-4 w-3/4" />
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <Skeleton className="h-11 w-11 rounded-xl" />

                        <Skeleton className="mt-5 h-5 w-24" />

                        <Skeleton className="mt-3 h-4 w-full" />

                        <Skeleton className="mt-2 h-4 w-3/4" />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <Skeleton className="h-11 w-11 rounded-xl" />

                        <Skeleton className="mt-5 h-5 w-28" />

                        <Skeleton className="mt-3 h-4 w-full" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <Skeleton className="h-6 w-36" />

                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div>
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="mt-3 h-8 w-24" />
                        </div>

                        <div>
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="mt-3 h-8 w-20" />
                        </div>

                        <div>
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="mt-3 h-8 w-28" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}