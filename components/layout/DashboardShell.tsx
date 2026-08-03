// components/layout/DashboardShell.tsx

'use client';

import { useState } from 'react';

import Sidebar from '@/components/layout/Sidebar';

type DashboardShellProps = {
    children: React.ReactNode;

    user: {
        name: string;
        email: string;
    };
};

export default function DashboardShell({
    children,
    user,
}: DashboardShellProps) {
    const [collapsed, setCollapsed] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
                user={user}
            />

            <div
                className={`
          min-h-screen
          transition-[padding]
          duration-300

          ${collapsed
                        ? 'lg:pl-20'
                        : 'lg:pl-72'
                    }
        `}
            >
                <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}