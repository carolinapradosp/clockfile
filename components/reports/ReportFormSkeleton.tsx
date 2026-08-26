import Skeleton from '@/components/ui/Skeleton';

function FieldSkeleton({ full = false, tall = false }: { full?: boolean; tall?: boolean }) {
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <Skeleton className="h-4 w-24" />

            <Skeleton className={`mt-2 w-full rounded-xl ${tall ? 'h-36' : 'h-12'}`} />
        </div>
    );
}

export default function ReportFormSkeleton() {
    return (
        <div aria-busy="true" aria-label="Carregando formulário de lançamento">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <Skeleton className="h-6 w-44" />

                    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FieldSkeleton full />

                    <FieldSkeleton />

                    <FieldSkeleton />

                    <FieldSkeleton full tall />
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                    <Skeleton className="h-6 w-40" />

                    <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <Skeleton className="h-4 w-20" />

                        <Skeleton className="mt-2 h-12 w-full rounded-xl" />

                        <Skeleton className="mt-2 h-3 w-48" />
                    </div>

                    <div>
                        <Skeleton className="h-4 w-28" />

                        <Skeleton className="mt-2 h-12 w-full rounded-xl" />

                        <Skeleton className="mt-2 h-3 w-32" />
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <Skeleton className="h-4 w-28" />

                    <Skeleton className="mt-3 h-9 w-36" />

                    <Skeleton className="mt-3 h-3 w-52" />
                </div>
            </section>

            <div className="mt-8 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Skeleton className="h-12 w-full rounded-xl sm:w-28" />

                <Skeleton className="h-12 w-full rounded-xl sm:w-40" />
            </div>
        </div>
    );
}
