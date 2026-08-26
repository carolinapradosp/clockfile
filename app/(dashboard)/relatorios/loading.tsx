import Skeleton from '@/components/ui/Skeleton';

function DesktopRowSkeleton() {
    return (
        <div className="grid grid-cols-6 items-center gap-4 border-t border-slate-100 px-5 py-4">
            <div className="col-span-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-3 w-28" />
            </div>

            <Skeleton className="h-4 w-20" />

            <Skeleton className="h-4 w-14" />

            <Skeleton className="h-4 w-20" />

            <div className="flex justify-end">
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
        </div>
    );
}

function MobileCardSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Skeleton className="h-5 w-40 max-w-full" />

                    <Skeleton className="mt-2 h-4 w-28" />
                </div>

                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
        </article>
    );
}

export default function ReportsLoading() {
    return (
        <div aria-busy="true" aria-label="Carregando relatórios">
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <Skeleton className="h-9 w-40" />

                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>

                <Skeleton className="h-12 w-40 rounded-xl" />
            </header>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
                    <div>
                        <Skeleton className="mb-2 h-4 w-10" />

                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>

                    <div>
                        <Skeleton className="mb-2 h-4 w-14" />

                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>

                    <Skeleton className="h-11 w-full self-end rounded-xl xl:w-24" />

                    <Skeleton className="h-11 w-full self-end rounded-xl xl:w-28" />
                </div>
            </section>

            <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
                <div className="grid grid-cols-6 gap-4 bg-slate-50 px-5 py-4">
                    <Skeleton className="col-span-2 h-4 w-28" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="ml-auto h-4 w-12" />
                </div>

                {Array.from({ length: 6 }).map((_, index) => (
                    <DesktopRowSkeleton key={index} />
                ))}
            </section>

            <section className="space-y-4 md:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <MobileCardSkeleton key={index} />
                ))}
            </section>
        </div>
    );
}