'use client';

import { handleLogout } from '@/app/actions/auth';
import { useTransition } from 'react';

export default function LogoutButton() {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => handleLogout())}
            disabled={isPending}
            className="underline cursor-pointer"
        >
            {isPending ? 'Saindo...' : 'Sair'}
        </button>
    );
}