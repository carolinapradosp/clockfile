'use client';

import { useState, useRef, useEffect } from 'react';
import { usePWA } from "@/hooks/usePWA";

export default function InstallButton() {
    const { canInstall, install } = usePWA();

    // O estado sempre começa como true. Ao recarregar a tela, ele volta a ser true automaticamente.
    const [isVisible, setIsVisible] = useState(true);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0, posX: 0, posY: 0 });

    useEffect(() => {
        const handleResize = () => {
            setPosition((prev) => {
                if (!buttonRef.current) return prev;
                const rect = buttonRef.current.getBoundingClientRect();
                const maxW = window.innerWidth - rect.width - 24;
                const maxH = window.innerHeight - rect.height - 24;

                return {
                    x: Math.min(Math.max(24, prev.x), maxW),
                    y: Math.min(Math.max(24, prev.y), maxH)
                };
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Se o hook do PWA disser que não pode instalar ou se o usuário clicou em fechar nesta sessão, esconde.
    if (!canInstall || !isVisible) return null;

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.close-btn')) return;

        dragInfo.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            posX: position.x,
            posY: position.y
        };

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragInfo.current.isDragging || !buttonRef.current) return;

        const deltaX = e.clientX - dragInfo.current.startX;
        const deltaY = e.clientY - dragInfo.current.startY;

        let newX = dragInfo.current.posX + deltaX;
        let newY = dragInfo.current.posY + deltaY;

        const rect = buttonRef.current.getBoundingClientRect();
        const padding = 16;
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;

        if (rect.left + deltaX < padding) newX = position.x;
        if (rect.right + deltaX > windowW - padding) newX = position.x;
        if (rect.top + deltaY < padding) newY = position.y;
        if (rect.bottom + deltaY > windowH - padding) newY = position.y;

        setPosition({ x: newX, y: newY });
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        dragInfo.current.isDragging = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div
            ref={buttonRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
            className="
        fixed
        bottom-4
        right-4
        z-50
        flex
        cursor-grab
        items-center
        gap-1
        rounded-full
        bg-[#42AE39]
        p-1.5
        pl-4
        text-sm
        font-semibold
        text-white
        shadow-2xl
        touch-none
        select-none
        active:cursor-grabbing
        hover:bg-[#36912E]
        transition-colors
      "
        >
            <button
                onClick={install}
                className="flex items-center gap-2 py-2 pr-2 cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Instalar App</span>
            </button>

            <span className="h-4 w-[1px] bg-white/20" aria-hidden="true" />

            <button
                onClick={() => setIsVisible(false)} // Apenas seta como false em memória
                className="
          close-btn
          rounded-full
          p-2
          text-white/80
          hover:bg-white/10
          hover:text-white
          transition-colors
        "
                aria-label="Fechar aviso de instalação"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}