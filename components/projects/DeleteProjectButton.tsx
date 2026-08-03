// components/projects/DeleteProjectButton.tsx

'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    deleteProject,
} from '@/app/actions/projects';

type DeleteProjectButtonProps = {
    projectId: string;
    projectName: string;
};

export default function DeleteProjectButton({
    projectId,
    projectName,
}: DeleteProjectButtonProps) {
    const router = useRouter();

    const [
        isPending,
        setIsPending,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    async function handleDelete() {
        const confirmed =
            window.confirm(
                `Deseja excluir permanentemente o projeto "${projectName}"?\n\nEssa ação não poderá ser desfeita.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsPending(true);
            setError('');

            const result =
                await deleteProject(
                    projectId
                );

            if (!result.success) {
                setError(
                    result.message
                );

                return;
            }

            router.replace('/projetos');
            router.refresh();
        } catch (deleteError) {
            console.error(
                'Erro ao excluir projeto:',
                deleteError
            );

            setError(
                'Não foi possível excluir o projeto.'
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
            >
                <Trash2 size={17} />

                {isPending
                    ? 'Excluindo...'
                    : 'Excluir'}
            </button>

            {error && (
                <p
                    role="alert"
                    className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}