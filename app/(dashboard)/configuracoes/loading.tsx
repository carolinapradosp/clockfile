// app/(dashboard)/configuracoes/loading.tsx

import Skeleton from '@/components/ui/Skeleton';

function FieldSkeleton() {
    return (
        <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-12 w-full rounded-xl" />
        </div>
    );
}

function CardHeaderSkeleton({
    titleWidth = 'w-32',
    descriptionWidth = 'w-64',
}: {
    titleWidth?: string;
    descriptionWidth?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1">
                <Skeleton className={`h-5 ${titleWidth}`} />

                <Skeleton
                    className={`mt-2 h-4 max-w-full ${descriptionWidth}`}
                />
            </div>
        </div>
    );
}

export default function SettingsLoading() {
    return (
        <div
            className="mx-auto max-w-5xl"
            aria-busy="true"
            aria-label="Carregando configurações"
        >
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

                    <div>
                        <Skeleton className="h-9 w-52 max-w-full" />

                        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <CardHeaderSkeleton
                        titleWidth="w-32"
                        descriptionWidth="w-72"
                    />

                    <div className="mt-6 space-y-5">
                        <FieldSkeleton />
                        <FieldSkeleton />
                        <FieldSkeleton />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Skeleton className="h-11 w-36 rounded-xl" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <CardHeaderSkeleton
                        titleWidth="w-28"
                        descriptionWidth="w-72"
                    />

                    <div className="mt-6 space-y-5">
                        <div>
                            <Skeleton className="h-4 w-20" />

                            <div className="relative mt-2">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full" />
                            </div>
                        </div>

                        <div>
                            <Skeleton className="h-4 w-20" />

                            <div className="relative mt-2">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full" />
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <Skeleton className="h-3 w-44" />

                            <div className="mt-3 space-y-3">
                                <Skeleton className="h-3 w-40" />
                                <Skeleton className="h-3 w-48" />
                                <Skeleton className="h-3 w-36" />
                                <Skeleton className="h-3 w-44" />
                            </div>
                        </div>

                        <div>
                            <Skeleton className="h-4 w-36" />

                            <div className="relative mt-2">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Skeleton className="h-11 w-32 rounded-xl" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <CardHeaderSkeleton
                        titleWidth="w-40"
                        descriptionWidth="w-72"
                    />

                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                        <Skeleton className="h-4 w-40" />

                        <Skeleton className="mt-3 h-4 w-72 max-w-full" />

                        <Skeleton className="mt-5 h-11 w-44 rounded-xl" />
                    </div>
                </section>
            </div>
        </div>
    );
}