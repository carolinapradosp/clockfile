// lib/users/get-current-app-user.ts

import 'server-only';

import {
  getCurrentUserId,
} from '@/lib/auth/current-user';

/*
 * Alias temporário.
 *
 * As actions existentes ainda importam
 * getCurrentAppUserId. Ele agora utiliza
 * o usuário real da sessão.
 */
export async function getCurrentAppUserId(): Promise<string> {
  return getCurrentUserId();
}