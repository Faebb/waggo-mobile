import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';
import { setSession } from '@/shared/auth/session';

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

/** Clears the session; `httpClient` stops sending a Bearer token right away. */
export function logout(): void {
  setSession(null);
}
