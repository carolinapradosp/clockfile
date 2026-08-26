import Skeleton from '@/components/ui/Skeleton';

function InformationItemSkeleton() {
    return (
        <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-4 w-32" />
        </div>
    );
}

export default function InvoiceDetailsSkeleton() {
    return (
        <div
            className="mx-auto max-w-6xl"
            aria-busy="true"
            aria-label="Carregando fatura"
        >
            <Skeleton className="mb-6 h-5 w-32" />

            <header className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-40" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    <Skeleton className="mt-3 h-4 w-36" />
                </div>

                <div className="flex gap-3">
                    <Skeleton className="h-11 w-24 rounded-xl" />
                    <Skeleton className="h-11 w-20 rounded-xl" />
                </div>
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                    <div>
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                    </div>

                    <Skeleton className="h-11 w-32 rounded-xl" />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-xl" />

                        <div>
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="mt-2 h-4 w-56" />
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <InformationItemSkeleton key={index} />
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-xl" />

                        <div className="flex-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="mt-2 h-4 w-full" />
                        </div>
                    </div>

                    <Skeleton className="mt-7 h-5 w-32" />
                    <Skeleton className="mt-3 h-4 w-28" />
                    <Skeleton className="mt-5 h-4 w-full" />
                    <Skeleton className="mt-3 h-4 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="mt-3 h-4 w-72 max-w-full" />

                    <div className="mt-6 overflow-hidden">
                        <div className="grid grid-cols-[1fr_130px_130px_130px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-3 w-20" />
                            ))}
                        </div>

                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-[1fr_130px_130px_130px] gap-4 border-b border-slate-100 px-4 py-4"
                            >
                                <div>
                                    <Skeleton className="h-4 w-52" />
                                    <Skeleton className="mt-2 h-3 w-32" />
                                </div>

                                <Skeleton className="h-4 w-12 justify-self-end" />
                                <Skeleton className="h-4 w-20 justify-self-end" />
                                <Skeleton className="h-4 w-20 justify-self-end" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Skeleton className="h-36 w-full max-w-sm rounded-xl" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
                    <Skeleton className="h-6 w-24" />

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <InformationItemSkeleton key={index} />
                        ))}
                    </div>
                </section>
            </div>

            <section className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-6">
                <Skeleton className="h-6 w-28" />

                <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
                <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />

                <Skeleton className="mt-5 h-11 w-28 rounded-xl" />
            </section>
        </div>
    );
}