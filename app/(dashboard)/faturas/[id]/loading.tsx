// app/(dashboard)/faturas/[id]/loading.tsx

import Skeleton from '@/components/ui/Skeleton';

function InfoSkeleton() {
    return (
        <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-4 w-32" />
        </div>
    );
}

export default function InvoiceDetailsLoading() {
    return (
        <div
            className="mx-auto max-w-6xl"
            aria-busy="true"
            aria-label="Carregando fatura"
        >
            <Skeleton className="mb-6 h-5 w-32" />

            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Skeleton className="h-9 w-40" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    <Skeleton className="mt-3 h-4 w-44" />
                </div>

                <div className="flex gap-3">
                    <Skeleton className="h-11 w-24 rounded-xl" />
                    <Skeleton className="h-11 w-20 rounded-xl" />
                </div>
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                    </div>

                    <Skeleton className="h-11 w-32 rounded-xl" />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-11 w-11 rounded-xl" />

                        <div>
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="mt-2 h-3 w-52" />
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InfoSkeleton />
                        <InfoSkeleton />
                        <InfoSkeleton />
                        <InfoSkeleton />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-11 w-11 rounded-xl" />

                        <div>
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="mt-2 h-3 w-44" />
                        </div>
                    </div>

                    <div className="mt-7 space-y-4">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </section>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-3 h-4 w-72" />

                <div className="mt-6">
                    <div className="grid grid-cols-[2fr_0.7fr_0.8fr_0.8fr] gap-4 bg-slate-50 px-4 py-3">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="ml-auto h-3 w-20" />
                        <Skeleton className="ml-auto h-3 w-12" />
                        <Skeleton className="ml-auto h-3 w-12" />
                    </div>

                    <div className="grid grid-cols-[2fr_0.7fr_0.8fr_0.8fr] gap-4 px-4 py-5">
                        <div>
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="mt-3 h-3 w-32" />
                        </div>

                        <Skeleton className="ml-auto h-4 w-10" />
                        <Skeleton className="ml-auto h-4 w-20" />
                        <Skeleton className="ml-auto h-5 w-24" />
                    </div>
                </div>

                <div className="mt-6 ml-auto max-w-sm rounded-xl bg-slate-50 p-5">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="flex justify-between border-t border-slate-200 pt-4">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-7 w-28" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <Skeleton className="h-6 w-20" />

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <InfoSkeleton key={index} />
                    ))}
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-red-100 bg-red-50/30 p-6">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-3 h-4 w-96 max-w-full" />
                <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                <Skeleton className="mt-5 h-11 w-28 rounded-xl" />
            </section>
        </div>
    );
}