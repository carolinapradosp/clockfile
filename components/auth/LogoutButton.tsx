'use client';

import { handleLogout } from '@/app/actions/auth';
import { useTransition } from 'react';

export default function LogoutButton() {
    const [isPending, startTransition] =
        useTransition();

    function logout() {
        startTransition(async () => {
            await handleLogout();
        });
    }

    return (
        <button
            type="button"
            onClick={logout}
            disabled={isPending}
            className="flex h-12 w-full items-center rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
        >
            {isPending ? 'Saindo...' : 'Sair'}
        </button>
    );
}