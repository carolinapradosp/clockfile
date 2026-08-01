// components/clients/ArchiveClientButton.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive } from 'lucide-react';

import { archiveClient } from '@/app/actions/clients';

type ArchiveClientButtonProps = {
    clientId: string;
    clientName: string;
};

export default function ArchiveClientButton({
    clientId,
    clientName,
}: ArchiveClientButtonProps) {
    const router = useRouter();

    const [isPending, setIsPending] =
        useState(false);

    const [error, setError] =
        useState('');

    async function handleArchive() {
        const confirmed =
            window.confirm(
                `Deseja arquivar o cliente "${clientName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsPending(true);
            setError('');

            const result =
                await archiveClient(clientId);

            if (!result.success) {
                setError(result.message);
                return;
            }

            router.replace('/clientes');
            router.refresh();
        } catch (archiveError) {
            console.error(
                'Erro ao arquivar cliente:',
                archiveError
            );

            setError(
                'Não foi possível arquivar o cliente.'
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