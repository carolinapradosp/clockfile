// projetos/page.tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

import ProjectsList from '@/components/projects/ProjectsList';
import ProjectsListSkeleton from '@/components/projects/ProjectsListSkeleton';

export default function ProjectsPage() {
    return (
        <div>
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projetos</h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Gerencie seus projetos, valores e períodos de execução.
                    </p>
                </div>

                <Link
                    href="/projetos/novo"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Novo projeto
                </Link>
            </header>

            <Suspense fallback={<ProjectsListSkeleton />}>
                <ProjectsList />
            </Suspense>
        </div>
    );
}
