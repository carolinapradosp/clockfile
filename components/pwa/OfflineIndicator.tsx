'use client';

import { usePWA } from "@/hooks/usePWA";

export default function OfflineIndicator() {
    const { isOnline } = usePWA();

    if (isOnline) return null;

    return (
        <div
            className="
      fixed
      top-4
      left-1/2
      z-50
      -translate-x-1/2
      rounded-xl
      bg-red-600
      px-4
      py-2
      text-white
      shadow-lg
      "
        >
            Você está offline.
        </div>
    );
}