import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';
import { getSession } from '@/shared/auth/session';

import type { ProfileUpdate, UserProfile } from '../model/types';

const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string().nullable(),
  phone: z.string().nullable(),
}) satisfies z.ZodType<UserProfile>;

/** GET /api/v1/users/me — the signed-in account's own profile. */
export async function getMyProfile(client: HttpClient = httpClient): Promise<UserProfile> {
  const { data } = await client.get('/api/v1/users/me', profileSchema);
  return data;
}

/** PUT /api/v1/users/me — a null clears that field. */
export async function updateMyProfile(update: ProfileUpdate, client: HttpClient = httpClient): Promise<UserProfile> {
  const { data } = await client.put('/api/v1/users/me', update, profileSchema);
  return data;
}

/**
 * RF-005 — PUT /api/v1/users/me/password. Sends this session's refresh token so it stays open while the API closes
 * the other sessions.
 */
export async function changeMyPassword(
  currentPassword: string,
  newPassword: string,
  client: HttpClient = httpClient,
): Promise<void> {
  const refreshToken = getSession()?.refreshToken;
  await client.put('/api/v1/users/me/password', { currentPassword, newPassword, refreshToken }, z.boolean());
}
