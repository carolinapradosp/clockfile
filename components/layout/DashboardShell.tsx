// components/layout/DashboardShell.tsx

'use client';

import { useState } from 'react';

import DashboardHeader from '@/components/layout/DashboardHeader';
import Sidebar from '@/components/layout/Sidebar';

type DashboardShellProps = Readonly<{
    children: React.ReactNode;
}>;

export default function DashboardShell({
    children,
}: DashboardShellProps) {
    const [collapsed, setCollapsed] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
            />

            <div
                className={`
          min-h-screen
          transition-[padding] duration-300

          ${collapsed
                        ? 'lg:pl-20'
                        : 'lg:pl-72'
                    }
        `}
            >
                <DashboardHeader />

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}