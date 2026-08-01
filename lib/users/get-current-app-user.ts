// lib/users/get-current-app-user.ts

import 'server-only';

import { sql } from '@/lib/db';

type AppUserRow = {
  id: string;
};

export async function getCurrentAppUserId(): Promise<string> {
  const name =
    process.env.APP_USER_NAME?.trim();

  const email =
    process.env.APP_USER_EMAIL
      ?.trim()
      .toLowerCase();

  if (!name || !email) {
    throw new Error(
      'APP_USER_NAME e APP_USER_EMAIL precisam estar configurados.'
    );
  }

  const rows = await sql`
    INSERT INTO public.app_users (
      name,
      email,
      created_at,
      updated_at
    )
    VALUES (
      ${name},
      ${email},
      NOW(),
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING id
  `;

  const user = rows[0] as AppUserRow | undefined;

  if (!user) {
    throw new Error(
      'Não foi possível localizar o usuário da aplicação.'
    );
  }

  return String(user.id);
}