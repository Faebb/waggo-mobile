import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';
import { setSession } from '@/shared/auth/session';

import type { LoginChallenge, RegisteredAccount, SessionTokens } from '../model/types';

const accountSchema = z.object({ id: z.string(), email: z.string() }) satisfies z.ZodType<RegisteredAccount>;
const challengeSchema = z.object({ challengeId: z.string() }) satisfies z.ZodType<LoginChallenge>;
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

/** RF-001 — GET /api/v1/auth/confirm: activates the account with the token emailed on registration. */
export async function confirmEmail(token: string, client: HttpClient = httpClient): Promise<void> {
  await client.get('/api/v1/auth/confirm', z.boolean(), { token });
}

/** RF-005, step 1 — POST /api/v1/auth/login: a right password raises the second factor (a code emailed). */
export async function login(email: string, password: string, client: HttpClient = httpClient): Promise<LoginChallenge> {
  const { data } = await client.post('/api/v1/auth/login', { email, password }, challengeSchema);
  return data;
}

/** RF-005, step 2 — POST /api/v1/auth/login/verify: the right code opens the session (RNF-002). */
export async function verifyLoginCode(
  challengeId: string,
  code: string,
  client: HttpClient = httpClient,
): Promise<SessionTokens> {
  const { data } = await client.post('/api/v1/auth/login/verify', { challengeId, code }, sessionSchema);
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
