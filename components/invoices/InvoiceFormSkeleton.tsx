// components/invoices/InvoiceFormSkeleton.tsx

import Skeleton from '@/components/ui/Skeleton';

function FieldSkeleton({
    full = false,
}: {
    full?: boolean;
}) {
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-12 w-full rounded-xl" />
        </div>
    );
}

export default function InvoiceFormSkeleton() {
    return (
        <div
            aria-busy="true"
            aria-label="Carregando formulário de fatura"
            className="space-y-6"
        >
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div>
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FieldSkeleton />
                    <FieldSkeleton />

                    <FieldSkeleton />
                    <FieldSkeleton />

                    <FieldSkeleton />

                    <div className="flex items-end">
                        <Skeleton className="h-11 w-48 rounded-xl" />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FieldSkeleton />
                    <FieldSkeleton />

                    <FieldSkeleton />
                    <FieldSkeleton />

                    <FieldSkeleton full />

                    <FieldSkeleton full />

                    <FieldSkeleton />
                    <FieldSkeleton />

                    <FieldSkeleton />
                    <FieldSkeleton />
                </div>
            </section>

            <section>
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-10 w-16 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                        <Skeleton className="h-10 w-20 rounded-xl" />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="mt-2 h-3 w-28" />
                        </div>

                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_0.7fr_0.8fr_1fr]">
                        <div>
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
                            <Skeleton className="mt-3 h-11 w-full rounded-xl" />
                        </div>

                        <div>
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
                        </div>

                        <div>
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
                        </div>

                        <div>
                            <Skeleton className="h-3 w-14" />
                            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="mt-4 h-28 w-full rounded-xl" />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                        <Skeleton className="h-5 w-16" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-20 rounded-xl" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="flex justify-between border-t border-slate-100 pt-4">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-7 w-28" />
                        </div>
                    </div>
                </section>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Skeleton className="h-12 w-full rounded-xl sm:w-28" />
                <Skeleton className="h-12 w-full rounded-xl sm:w-40" />
                <Skeleton className="h-12 w-full rounded-xl sm:w-36" />
            </div>
        </div>
    );
}