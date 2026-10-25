import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

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
