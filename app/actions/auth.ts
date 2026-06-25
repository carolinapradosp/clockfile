'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type ActionState = {
  error: string | null;
} | null;

export async function handleLogin(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get('password');
  const expectedPassword = process.env.AREA_LOGADA;

  if (password === expectedPassword) {
    // Define o cookie de sessão (expira em 1 dia, HTTP-only para segurança básica)
    const cookieStore = await cookies();
    cookieStore.set('auth_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    redirect('/lancamento'); 
  }

  return { error: 'Senha incorreta. Tente novamente.' };
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  redirect('/'); // Redireciona para a home após o logout
}