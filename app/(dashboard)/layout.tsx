// app/(dashboard)/layout.tsx

import type { Metadata } from 'next';

import DashboardShell from '@/components/layout/DashboardShell';
import { requireCurrentUser } from '@/lib/auth/current-user';

export const metadata: Metadata = {
    title: {
        default: 'Dashboard',
        template: '%s | Clockfile',
    },
};

type DashboardLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    /*
     * O proxy verifica apenas a presença do cookie.
     * Aqui validamos efetivamente a sessão no banco.
     */
    const user = await requireCurrentUser();

    return (
        <DashboardShell
            user={{
                name: user.name,
                email: user.email,
            }}
        >
            {children}
        </DashboardShell>
    );
}
