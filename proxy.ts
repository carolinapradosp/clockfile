// proxy.ts

import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'clockfile_session';

const PUBLIC_ROUTES = new Set(['/', '/cadastro']);

const PROTECTED_ROUTE_PREFIXES = [
    '/dashboard',
    '/projetos',
    '/relatorios',
    '/faturas',
    '/configuracoes',
];

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    const isPublicRoute = PUBLIC_ROUTES.has(pathname);

    if (isProtectedRoute(pathname) && !sessionToken) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isPublicRoute && sessionToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/cadastro',
        '/dashboard/:path*',
        '/projetos/:path*',
        '/relatorios/:path*',
        '/faturas/:path*',
        '/configuracoes/:path*',
    ],
};
