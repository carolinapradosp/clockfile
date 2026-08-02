// lib/auth/session.ts

import 'server-only';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import {
  cookies,
  headers,
} from 'next/headers';

import { sql } from '@/lib/db';

export const SESSION_COOKIE_NAME =
  'clockfile_session';

const SESSION_DURATION_SECONDS =
  60 * 60 * 24 * 7;

const SESSION_REFRESH_THRESHOLD_SECONDS =
  60 * 60 * 24;

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string | Date;
};

type CreateSessionOptions = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type ValidSession = {
  id: string;
  userId: string;
  expiresAt: string;
};

function createSessionToken(): string {
  /*
   * 32 bytes = 256 bits de entropia.
   * O token puro ficará apenas no cookie.
   */
  return randomBytes(32).toString(
    'base64url'
  );
}

export function hashSessionToken(
  token: string
): string {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

function normalizeDateTime(
  value: string | Date
): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function getSessionExpiration(): Date {
  return new Date(
    Date.now() +
      SESSION_DURATION_SECONDS * 1000
  );
}

function getCookieOptions(
  expiresAt: Date
) {
  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
    maxAge: SESSION_DURATION_SECONDS,
    priority: 'high' as const,
  };
}

function normalizeIpAddress(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  /*
   * x-forwarded-for pode conter uma lista:
   * cliente, proxy1, proxy2.
   */
  const firstAddress =
    value.split(',')[0]?.trim();

  return firstAddress || null;
}

export async function getRequestSessionMetadata(): Promise<CreateSessionOptions> {
  const headerStore =
    await headers();

  return {
    userAgent:
      headerStore.get('user-agent'),

    ipAddress: normalizeIpAddress(
      headerStore.get(
        'x-forwarded-for'
      ) ??
        headerStore.get(
          'x-real-ip'
        )
    ),
  };
}

export async function createSession({
  userId,
  userAgent,
  ipAddress,
}: {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  const token =
    createSessionToken();

  const tokenHash =
    hashSessionToken(token);

  const expiresAt =
    getSessionExpiration();

  const rows = await sql`
    INSERT INTO public.auth_sessions (
      user_id,
      token_hash,
      expires_at,
      created_at,
      last_seen_at,
      user_agent,
      ip_address
    )
    VALUES (
      ${userId}::uuid,
      ${tokenHash},
      ${expiresAt.toISOString()}::timestamptz,
      NOW(),
      NOW(),
      ${userAgent ?? null},
      ${normalizeIpAddress(
        ipAddress
      )}::inet
    )
    RETURNING id
  `;

  if (!rows[0]) {
    throw new Error(
      'Não foi possível criar a sessão.'
    );
  }

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    getCookieOptions(expiresAt)
  );
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore =
    await cookies();

  return (
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value ?? null
  );
}

export async function getValidSession(): Promise<ValidSession | null> {
  const token =
    await getSessionToken();

  if (!token) {
    return null;
  }

  const tokenHash =
    hashSessionToken(token);

  /*
   * Atualiza last_seen_at apenas uma vez
   * a cada 15 minutos para evitar uma escrita
   * no banco em toda navegação.
   */
  const rows = await sql`
    WITH valid_session AS (
      SELECT
        id,
        user_id,
        expires_at,
        last_seen_at

      FROM public.auth_sessions

      WHERE
        token_hash = ${tokenHash}
        AND revoked_at IS NULL
        AND expires_at > NOW()

      LIMIT 1
    ),

    refreshed_session AS (
      UPDATE public.auth_sessions session

      SET last_seen_at = NOW()

      FROM valid_session

      WHERE
        session.id =
          valid_session.id

        AND valid_session.last_seen_at <
          NOW() - INTERVAL '15 minutes'

      RETURNING
        session.id,
        session.user_id,
        session.expires_at
    )

    SELECT
      valid_session.id,
      valid_session.user_id,
      valid_session.expires_at

    FROM valid_session
  `;

  const session =
    rows[0] as
      | SessionRow
      | undefined;

  if (!session) {
    return null;
  }

  return {
    id: String(session.id),
    userId: String(session.user_id),
    expiresAt: normalizeDateTime(
      session.expires_at
    ),
  };
}

export async function refreshSession(): Promise<boolean> {
  const token =
    await getSessionToken();

  if (!token) {
    return false;
  }

  const tokenHash =
    hashSessionToken(token);

  const expiresAt =
    getSessionExpiration();

  const rows = await sql`
    UPDATE public.auth_sessions
    SET
      expires_at =
        ${expiresAt.toISOString()}::timestamptz,
      last_seen_at = NOW()

    WHERE
      token_hash = ${tokenHash}
      AND revoked_at IS NULL
      AND expires_at > NOW()

      AND expires_at <
        NOW()
        + ${SESSION_REFRESH_THRESHOLD_SECONDS}
        * INTERVAL '1 second'

    RETURNING id
  `;

  /*
   * A sessão ainda pode estar válida, mas fora
   * da janela de renovação. Nesse caso não há
   * necessidade de alterar o cookie.
   */
  if (!rows[0]) {
    return false;
  }

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    getCookieOptions(expiresAt)
  );

  return true;
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

  if (token) {
    const tokenHash =
      hashSessionToken(token);

    await sql`
      UPDATE public.auth_sessions
      SET revoked_at =
        COALESCE(
          revoked_at,
          NOW()
        )
      WHERE token_hash =
        ${tokenHash}
    `;
  }

  cookieStore.set(
    SESSION_COOKIE_NAME,
    '',
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    }
  );
}

export async function deleteAllUserSessions(
  userId: string
): Promise<void> {
  await sql`
    UPDATE public.auth_sessions
    SET revoked_at =
      COALESCE(
        revoked_at,
        NOW()
      )
    WHERE
      user_id = ${userId}::uuid
      AND revoked_at IS NULL
  `;
}

export async function deleteExpiredSessions(): Promise<number> {
  const rows = await sql`
    DELETE FROM public.auth_sessions
    WHERE
      expires_at < NOW()

      OR (
        revoked_at IS NOT NULL
        AND revoked_at <
          NOW() - INTERVAL '7 days'
      )
    RETURNING id
  `;

  return rows.length;
}