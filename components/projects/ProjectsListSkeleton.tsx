import Skeleton from '@/components/ui/Skeleton';

function ProjectCardSkeleton() {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />

                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="mt-5">
                <Skeleton className="h-6 w-2/3" />

                <Skeleton className="mt-3 h-4 w-full" />

                <Skeleton className="mt-2 h-4 w-4/5" />
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />

                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />

                    <Skeleton className="h-4 w-44" />
                </div>
            </div>
        </article>
    );
}

export default function ProjectsListSkeleton() {
    return (
        <section
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
            aria-label="Carregando projetos"
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <ProjectCardSkeleton key={index} />
            ))}
        </section>
    );
}
