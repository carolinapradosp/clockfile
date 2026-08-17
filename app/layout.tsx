import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: 'Clockfile',
        template: '%s | Clockfile',
    },
    // icons: '/icons/icon-72.png',

    description: 'Controle de horas trabalhadas',
    applicationName: 'Clockfile',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Clockfile',
    },
};

export const viewport: Viewport = {
    themeColor: '#2563eb',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pt-BR"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
        </html>
    );
}
