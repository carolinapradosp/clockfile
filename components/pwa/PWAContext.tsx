'use client';

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

export interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

interface PWAContextData {
    isOnline: boolean;
    isInstalled: boolean;
    canInstall: boolean;
    install: () => Promise<void>;
}

export const PWAContext = createContext<PWAContextData>({
    isOnline: true,
    isInstalled: false,
    canInstall: false,
    install: async () => { },
});

export function PWAContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOnline, setIsOnline] = useState(() => {
        if (typeof window === 'undefined') {
            return true;
        }

        return navigator.onLine;
    });

    const [isInstalled, setIsInstalled] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia('(display-mode: standalone)').matches;
    });

    const [promptEvent, setPromptEvent] =
        useState<BeforeInstallPromptEvent | null>(null);

    /**
     * Monitora conexão com a internet
     */
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);

        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    /**
     * Monitora se o app foi instalado
     */
    useEffect(() => {
        const media = window.matchMedia('(display-mode: standalone)');

        const handleChange = (event: MediaQueryListEvent) => {
            setIsInstalled(event.matches);
        };

        media.addEventListener('change', handleChange);

        return () => {
            media.removeEventListener('change', handleChange);
        };
    }, []);

    /**
     * Captura o evento de instalação do PWA
     */
    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();

            setPromptEvent(event as BeforeInstallPromptEvent);

            console.log('[PWA] Instalação disponível');
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt as EventListener
        );

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt as EventListener
            );
        };
    }, []);

    /**
     * Executa a instalação
     */
    const install = useCallback(async () => {
        if (!promptEvent) {
            return;
        }

        await promptEvent.prompt();

        const { outcome } = await promptEvent.userChoice;

        console.log(`[PWA] Resultado da instalação: ${outcome}`);

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setPromptEvent(null);
    }, [promptEvent]);

    const value = useMemo(
        () => ({
            isOnline,
            isInstalled,
            canInstall: !!promptEvent,
            install,
        }),
        [isOnline, isInstalled, promptEvent, install]
    );

    return (
        <PWAContext.Provider value={value}>
            {children}
        </PWAContext.Provider>
    );
}