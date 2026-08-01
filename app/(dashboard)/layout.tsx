// app/(dashboard)/layout.tsx

import type { Metadata } from 'next';

import DashboardShell from '@/components/layout/DashboardShell';

export const metadata: Metadata = {
    title: 'Dashboard',
};

type DashboardLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <DashboardShell>
            {children}
        </DashboardShell>
    );
}