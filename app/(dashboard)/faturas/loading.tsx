import Skeleton from '@/components/ui/Skeleton';

function SummarySkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-4 h-7 w-28" />
                </div>

                <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
        </article>
    );
}

function InvoiceRowSkeleton() {
    return (
        <div className="grid grid-cols-[1.1fr_1.1fr_0.9fr_0.85fr_0.8fr_0.8fr_auto] items-center gap-5 border-t border-slate-100 px-5 py-5">
            <div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="mt-2 h-3 w-28" />
            </div>

            <Skeleton className="h-4 w-32" />

            <Skeleton className="h-4 w-24" />

            <Skeleton className="h-4 w-20" />

            <Skeleton className="h-6 w-20 rounded-full" />

            <Skeleton className="h-5 w-24" />

            <div className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
        </div>
    );
}

export default function InvoicesLoading() {
    return (
        <div aria-busy="true" aria-label="Carregando faturas">
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>

                <Skeleton className="h-12 w-36 rounded-xl" />
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[44px_1fr_1fr_1fr_auto] lg:items-end">
                    <Skeleton className="h-11 w-11 rounded-xl" />

                    <div>
                        <Skeleton className="mb-2 h-3 w-8" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="mb-2 h-3 w-14" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="mb-2 h-3 w-12" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <Skeleton className="h-12 w-full rounded-xl lg:w-28" />
                </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <SummarySkeleton key={index} />
                ))}
            </section>

            <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
                <div className="grid grid-cols-[1.1fr_1.1fr_0.9fr_0.85fr_0.8fr_0.8fr_auto] gap-5 bg-slate-50 px-5 py-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="ml-auto h-3 w-12" />
                </div>

                {Array.from({ length: 5 }).map((_, index) => (
                    <InvoiceRowSkeleton key={index} />
                ))}
            </section>

            <section className="space-y-4 lg:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <article
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <div className="flex justify-between gap-4">
                            <div>
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="mt-2 h-4 w-32" />
                            </div>

                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}