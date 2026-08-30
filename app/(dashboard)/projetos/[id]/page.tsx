//app/(dashboard)/projetos/[id]/page.tsx
import { Suspense } from 'react';

import ProjectDetailsContent from '@/components/projects/ProjectDetailsContent';
import ProjectDetailsSkeleton from '@/components/projects/ProjectDetailsSkeleton';

type ProjectDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<ProjectDetailsSkeleton />}>
            <ProjectDetailsContent projectId={id} />
        </Suspense>
    );
}
