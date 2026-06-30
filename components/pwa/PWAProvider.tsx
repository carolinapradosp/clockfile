'use client';

import { useEffect } from 'react';

import { registerServiceWorker } from '@/lib/register-sw';

import { PWAContextProvider } from './PWAContext';

export default function PWAProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return (
        <PWAContextProvider>
            {children}
        </PWAContextProvider>
    );
}