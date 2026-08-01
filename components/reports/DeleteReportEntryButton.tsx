// components/reports/DeleteReportEntryButton.tsx

'use client';

import {
    Trash2,
} from 'lucide-react';

import {
    useRouter,
} from 'next/navigation';

import {
    useState,
} from 'react';

import {
    deleteReportEntry,
} from '@/app/actions/report';

type DeleteReportEntryButtonProps = {
    entryId: string;
    task: string;

    redirectAfterDelete?: string;

    variant?: 'icon' | 'button';
};

export default function DeleteReportEntryButton({
    entryId,
    task,
    redirectAfterDelete,
    variant = 'icon',
}: DeleteReportEntryButtonProps) {
    const router = useRouter();

    const [
        isPending,
        setIsPending,
    ] = useState(false);

    const [error, setError] =
        useState('');

    async function handleDelete() {
        const confirmed =
            window.confirm(
                `Deseja excluir o lançamento "${task}"? Essa ação não poderá ser desfeita.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsPending(true);
            setError('');

            const result =
                await deleteReportEntry(
                    entryId
                );

            if (!result.success) {
                setError(result.message);

                return;
            }

            if (redirectAfterDelete) {
                router.replace(
                    redirectAfterDelete
                );
            }

            router.refresh();
        } catch (deleteError) {
            console.error(
                'Erro ao excluir lançamento:',
                deleteError
            );

            setError(
                'Não foi possível excluir o lançamento.'
            );
        } finally {
            setIsPending(false);
        }
    }

    if (variant === 'button') {
        return (
            <div>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                >
                    <Trash2 size={17} />

                    {isPending
                        ? 'Excluindo...'
                        : 'Excluir'}
                </button>

                {error && (
                    <p className="mt-2 max-w-56 text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end">
            <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                title="Excluir lançamento"
                aria-label={`Excluir ${task}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
            >
                <Trash2 size={16} />
            </button>

            {error && (
                <p className="mt-1 max-w-44 text-right text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}