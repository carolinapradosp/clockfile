'use client';

import { useEffect } from 'react';

export default function InstallPrompt() {
    useEffect(() => {
        const handler = (event: Event) => {
            event.preventDefault();

            console.log('[PWA] Instalação disponível');
        };

        window.addEventListener(
            'beforeinstallprompt',
            handler as EventListener
        );

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handler as EventListener
            );
        };
    }, []);

    return null;
}