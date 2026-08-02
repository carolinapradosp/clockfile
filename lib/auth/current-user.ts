// lib/auth/current-user.ts

import 'server-only';

import { redirect } from 'next/navigation';

import { sql } from '@/lib/db';

import {
  getValidSession,
} from '@/lib/auth/session';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'blocked';
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CurrentUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'blocked';
  last_login_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function normalizeDateTime(
  value: string | Date | null
): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function mapCurrentUser(
  row: CurrentUserRow
): CurrentUser {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,

    lastLoginAt:
      normalizeDateTime(
        row.last_login_at
      ),

    createdAt:
      normalizeDateTime(
        row.created_at
      ) ?? '',

    updatedAt:
      normalizeDateTime(
        row.updated_at
      ) ?? '',
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session =
    await getValidSession();

  if (!session) {
    return null;
  }

  const rows = await sql`
    SELECT
      user_account.id,
      user_account.name,
      user_account.email,
      user_account.phone,
      user_account.status,
      user_account.last_login_at,
      user_account.created_at,
      user_account.updated_at

    FROM public.app_users
      AS user_account

    INNER JOIN public.auth_sessions
      AS session
      ON session.user_id =
        user_account.id

    WHERE
      user_account.id =
        ${session.userId}::uuid

      AND user_account.status =
        'active'

      AND session.id =
        ${session.id}::uuid

      AND session.revoked_at
        IS NULL

      AND session.expires_at >
        NOW()

    LIMIT 1
  `;

  const user =
    rows[0] as
      | CurrentUserRow
      | undefined;

  return user
    ? mapCurrentUser(user)
    : null;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return user;
}

export async function getCurrentUserId(): Promise<string> {
  const user =
    await requireCurrentUser();

  return user.id;
}