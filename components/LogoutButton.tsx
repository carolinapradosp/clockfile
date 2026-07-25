'use client';

import { handleLogout } from '@/app/actions/auth';
import { useTransition } from 'react';

export default function LogoutButton() {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => handleLogout())}
            disabled={isPending}
            className="md:text-base text-sm underline cursor-pointer"
        >
            {isPending ? 'Leaving...' : 'Log out'}
        </button>
    );
}