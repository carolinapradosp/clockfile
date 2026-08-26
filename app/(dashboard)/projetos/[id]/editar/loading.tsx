import Skeleton from '@/components/ui/Skeleton';

function FieldSkeleton({
    full = false,
    tall = false,
}: {
    full?: boolean;
    tall?: boolean;
}) {
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <Skeleton className="h-4 w-24" />

            <Skeleton
                className={`mt-2 w-full rounded-xl ${tall ? 'h-36' : 'h-12'
                    }`}
            />
        </div>
    );
}

function SectionHeaderSkeleton({
    titleWidth = 'w-40',
    descriptionWidth = 'w-72',
}: {
    titleWidth?: string;
    descriptionWidth?: string;
}) {
    return (
        <div className="mb-6">
            <Skeleton className={`h-6 ${titleWidth}`} />

            <Skeleton
                className={`mt-3 h-4 max-w-full ${descriptionWidth}`}
            />
        </div>
    );
}

export default function EditProjectLoading() {
    return (
        <div
            className="mx-auto max-w-4xl"
            aria-busy="true"
            aria-label="Carregando edição do projeto"
        >
            <Skeleton className="mb-6 h-5 w-40" />

            <header className="mb-8">
                <Skeleton className="h-9 w-52" />

                <Skeleton className="mt-3 h-4 w-72 max-w-full" />
            </header>

            <div className="space-y-8">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <SectionHeaderSkeleton
                        titleWidth="w-48"
                        descriptionWidth="w-64"
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <FieldSkeleton full />

                        <FieldSkeleton full tall />

                        <FieldSkeleton />

                        <FieldSkeleton />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <SectionHeaderSkeleton
                        titleWidth="w-24"
                        descriptionWidth="w-80"
                    />

                    <FieldSkeleton />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <SectionHeaderSkeleton
                        titleWidth="w-44"
                        descriptionWidth="w-96"
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <SectionHeaderSkeleton
                        titleWidth="w-20"
                        descriptionWidth="w-96"
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <FieldSkeleton />
                        <FieldSkeleton />
                    </div>
                </section>

                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <Skeleton className="h-12 w-full rounded-xl sm:w-28" />

                    <Skeleton className="h-12 w-full rounded-xl sm:w-40" />
                </div>
            </div>
        </div>
    );
}