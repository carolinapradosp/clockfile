// app/actions/auth.ts

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type ActionState =
  | {
      error: string;
    }
  | null;

const COOKIE_NAME = 'auth_session';

export async function handleLogin(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get('password');

  if (
    typeof password !== 'string' ||
    !password
  ) {
    return {
      error: 'Informe a senha de acesso.',
    };
  }

  const expectedPassword =
    process.env.AREA_LOGADA;

  if (!expectedPassword) {
    console.error(
      'A variável AREA_LOGADA não foi configurada.'
    );

    return {
      error: 'Não foi possível validar o acesso.',
    };
  }

  if (password !== expectedPassword) {
    return {
      error: 'Senha inválida.',
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    'authenticated',
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  redirect('/dashboard');
}

export async function handleLogout(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);

  redirect('/');
}