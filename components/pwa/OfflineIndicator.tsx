'use client';

import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const update = () => setOnline(navigator.onLine);

        update();

        window.addEventListener('online', update);
        window.addEventListener('offline', update);

        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);

    if (online) return null;

    return (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Você está offline.
        </div>
    );
}