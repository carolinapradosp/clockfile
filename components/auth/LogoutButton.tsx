// components/auth/LogoutButton.tsx

'use client';

import { LogOut } from 'lucide-react';
import { useTransition } from 'react';

import { handleLogout } from '@/app/actions/auth';

type LogoutButtonProps = {
    collapsed?: boolean;
};

export default function LogoutButton({ collapsed = false }: LogoutButtonProps) {
    const [isPending, startTransition] = useTransition();

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
            title={collapsed ? 'Sair' : undefined}
            aria-label="Sair da conta"
            className={`
        flex h-11 items-center
        rounded-xl
        px-3
        text-sm
        cursor-pointer
        font-semibold
        text-slate-500
        transition-colors
        hover:bg-red-50
        hover:text-red-600
        disabled:cursor-wait
        disabled:opacity-50

        ${collapsed ? 'lg:w-11 lg:justify-center' : 'w-full gap-3'}
      `}
        >
            <LogOut size={18} className="shrink-0" />

            <span className={collapsed ? 'lg:hidden' : ''}>{isPending ? 'Saindo...' : 'Sair'}</span>
        </button>
    );
}
