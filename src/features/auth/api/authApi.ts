import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';
import { getSession, setSession } from '@/shared/auth/session';

import type { RegisteredAccount, SessionTokens } from '../model/types';

const accountSchema = z.object({ id: z.string(), email: z.string() }) satisfies z.ZodType<RegisteredAccount>;
const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresInSeconds: z.number(),
}) satisfies z.ZodType<SessionTokens>;

/** RF-001 — POST /api/v1/auth/register: the account stays inactive until the email is confirmed. */
export async function register(
  email: string,
  password: string,
  client: HttpClient = httpClient,
): Promise<RegisteredAccount> {
  const { data } = await client.post('/api/v1/auth/register', { email, password }, accountSchema);
  return data;
}

/** RF-001 — POST /api/v1/auth/confirm: activates the account with the 6-digit code emailed on registration. */
export async function confirmEmail(email: string, code: string, client: HttpClient = httpClient): Promise<void> {
  await client.post('/api/v1/auth/confirm', { email, code }, z.boolean());
}

/** RF-001 — POST /api/v1/auth/resend-confirmation: a new code; the API answers the same for any email. */
export async function resendConfirmation(email: string, client: HttpClient = httpClient): Promise<void> {
  await client.post('/api/v1/auth/resend-confirmation', { email }, z.boolean());
}

/** RF-001, RF-005 — POST /api/v1/auth/forgot-password: a 6-digit recovery code; the API answers the same for any email. */
export async function forgotPassword(email: string, client: HttpClient = httpClient): Promise<void> {
  await client.post('/api/v1/auth/forgot-password', { email }, z.boolean());
}

/** RF-001, RF-005 — POST /api/v1/auth/reset-password: the emailed code sets a new password and closes every session. */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
  client: HttpClient = httpClient,
): Promise<void> {
  await client.post('/api/v1/auth/reset-password', { email, code, newPassword }, z.boolean());
}

/** RF-005 — POST /api/v1/auth/login: a right password and a confirmed account open the session (ADR-017, no second factor). */
export async function login(email: string, password: string, client: HttpClient = httpClient): Promise<SessionTokens> {
  const { data } = await client.post('/api/v1/auth/login', { email, password }, sessionSchema);
  setSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + data.expiresInSeconds * 1000,
  });
  return data;
}

/**
 * RF-005 — POST /api/v1/auth/logout: signs out locally first (`httpClient` stops sending the Bearer token right
 * away) and then revokes the refresh token on the server. A failed request never keeps the person signed in.
 */
export async function logout(client: HttpClient = httpClient): Promise<void> {
  const refreshToken = getSession()?.refreshToken;
  setSession(null);
  if (!refreshToken) return;

  try {
    await client.post('/api/v1/auth/logout', { refreshToken }, z.boolean());
  } catch {
    // Offline or the API is down: the refresh token simply expires on its own (30 days).
  }
}
