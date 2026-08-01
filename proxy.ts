// proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/clientes',
  '/projetos',
  '/relatorios',
  '/faturas',
  '/configuracoes',
];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session =
    request.cookies.get('auth_session')?.value;

  /*
   * Usuário não autenticado tentando acessar
   * uma página interna.
   */
  if (isProtectedRoute(pathname) && !session) {
    const loginUrl = new URL('/', request.url);

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Usuário autenticado tentando acessar
   * a página de login.
   */
  if (pathname === '/' && session) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/clientes/:path*',
    '/projetos/:path*',
    '/relatorios/:path*',
    '/faturas/:path*',
    '/configuracoes/:path*',
  ],
};