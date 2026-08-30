import ProjectDetailsContent from '@/components/projects/ProjectDetailsContent';

type ProjectDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
    const { id } = await params;

    return <ProjectDetailsContent projectId={id} />;
}
