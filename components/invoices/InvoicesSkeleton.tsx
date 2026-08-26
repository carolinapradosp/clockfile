import Skeleton from '@/components/ui/Skeleton';

function SummaryCardSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-3 h-7 w-32" />
                </div>

                <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
        </article>
    );
}

export default function InvoicesSkeleton() {
    return (
        <div aria-busy="true" aria-label="Carregando faturas">
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>

                <Skeleton className="h-12 w-36 rounded-xl" />
            </header>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[44px_1fr_1fr_1fr_auto] lg:items-end">
                    <Skeleton className="h-11 w-11 rounded-xl" />

                    <div>
                        <Skeleton className="mb-3 h-3 w-10" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="mb-3 h-3 w-16" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="mb-3 h-3 w-14" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <Skeleton className="h-12 w-28 rounded-xl" />
                </div>
            </section>

            <section className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <SummaryCardSkeleton key={index} />
                ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-4 md:grid md:grid-cols-[1fr_1fr_1fr_0.8fr_0.7fr_0.8fr_100px] md:gap-4">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <Skeleton key={index} className="h-3 w-16" />
                    ))}
                </div>

                <div className="divide-y divide-slate-100">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_1fr_1fr_0.8fr_0.7fr_0.8fr_100px] md:items-center"
                        >
                            <div>
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="mt-2 h-3 w-28" />
                            </div>

                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-24" />

                            <div className="flex gap-3">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}