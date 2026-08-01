// components/projects/ArchiveProjectButton.tsx

'use client';

import { Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { archiveProject } from '@/app/actions/projects';

type ArchiveProjectButtonProps = {
    projectId: string;
    projectName: string;
};

export default function ArchiveProjectButton({
    projectId,
    projectName,
}: ArchiveProjectButtonProps) {
    const router = useRouter();

    const [
        isPending,
        setIsPending,
    ] = useState(false);

    const [error, setError] =
        useState('');

    async function handleArchive() {
        const confirmed =
            window.confirm(
                `Deseja arquivar o projeto "${projectName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsPending(true);
            setError('');

            const result =
                await archiveProject(
                    projectId
                );

            if (!result.success) {
                setError(result.message);
                return;
            }

            router.replace('/projetos');
            router.refresh();
        } catch (archiveError) {
            console.error(
                'Erro ao arquivar projeto:',
                archiveError
            );

            setError(
                'Não foi possível arquivar o projeto.'
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleArchive}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
            >
                <Archive size={17} />

                {isPending
                    ? 'Arquivando...'
                    : 'Arquivar'}
            </button>

            {error && (
                <p className="mt-2 text-sm font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}