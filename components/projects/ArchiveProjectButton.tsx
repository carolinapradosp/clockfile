'use client';

import { Archive, ArchiveRestore, LoaderCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { updateProjectArchiveStatus } from '@/app/actions/projects';

import ConfirmModal from '@/components/ui/ConfirmModal';

type ArchiveProjectButtonProps = {
    projectId: string;
    projectName: string;
    isArchived: boolean;
};

export default function ArchiveProjectButton({
    projectId,
    projectName,
    isArchived,
}: ArchiveProjectButtonProps) {
    const router = useRouter();

    const [isActionPending, setIsActionPending] = useState(false);

    const [isRefreshing, startRefreshTransition] = useTransition();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const [error, setError] = useState('');

    const isPending = isActionPending || isRefreshing;

    const isReactivating = isArchived;

    const buttonLabel = isReactivating ? 'Reativar' : 'Arquivar';

    const pendingLabel = isReactivating ? 'Reativando...' : 'Arquivando...';

    const modalTitle = isReactivating ? 'Reativar projeto?' : 'Arquivar projeto?';

    const modalDescription = isReactivating
        ? `Deseja reativar o projeto "${projectName}"? Ele voltará ao status ativo e ficará novamente disponível para novos lançamentos e faturas.`
        : `Deseja arquivar o projeto "${projectName}"? Ele continuará visível na listagem, mas não poderá receber novos lançamentos ou faturas até ser reativado. Os dados existentes serão preservados.`;

    const confirmLabel = isReactivating ? 'Reativar projeto' : 'Arquivar projeto';

    function handleOpenConfirmation() {
        setError('');
        setIsConfirmOpen(true);
    }

    function handleCancelConfirmation() {
        if (isPending) {
            return;
        }

        setIsConfirmOpen(false);
    }

    async function handleConfirmArchiveStatus() {
        if (isPending) {
            return;
        }

        try {
            setIsActionPending(true);
            setError('');

            const result = await updateProjectArchiveStatus({
                projectId,
                archived: !isArchived,
            });

            if (!result.success) {
                setError(result.message);
                return;
            }

            setIsConfirmOpen(false);

            startRefreshTransition(() => {
                router.refresh();
            });
        } catch (archiveError) {
            console.error(
                isReactivating ? 'Erro ao reativar projeto:' : 'Erro ao arquivar projeto:',
                archiveError
            );

            setError(
                isReactivating
                    ? 'Não foi possível reativar o projeto.'
                    : 'Não foi possível arquivar o projeto.'
            );
        } finally {
            setIsActionPending(false);
        }
    }

    return (
        <>
            <div>
                <button
                    type="button"
                    onClick={handleOpenConfirmation}
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-50"
                >
                    {isPending ? (
                        <LoaderCircle size={17} className="animate-spin" />
                    ) : isReactivating ? (
                        <ArchiveRestore size={17} />
                    ) : (
                        <Archive size={17} />
                    )}

                    {isPending ? pendingLabel : buttonLabel}
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

            <ConfirmModal
                open={isConfirmOpen}
                title={modalTitle}
                description={modalDescription}
                confirmLabel={confirmLabel}
                cancelLabel="Cancelar"
                loading={isPending}
                onConfirm={handleConfirmArchiveStatus}
                onCancel={handleCancelConfirmation}
            />
        </>
    );
}