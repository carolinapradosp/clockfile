import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('auth_session')?.value;
  const { pathname } = request.nextUrl;

  // Rotas que exigem autenticação
  const isProtectedRoute = pathname.startsWith('/lancamento') || pathname.startsWith('/relatorios') || pathname.startsWith('/invoice-generator');

  // Se for uma rota protegida e o usuário NÃO tiver o cookie, redireciona para a home (login)
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se o usuário já estiver logado e tentar ir para a Home (tela de login), manda direto para os lançamentos
  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/lancamento', request.url));
  }

  return NextResponse.next();
}

// Configura quais caminhos o middleware deve avaliar (evita rodar em arquivos estáticos/imagens)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};