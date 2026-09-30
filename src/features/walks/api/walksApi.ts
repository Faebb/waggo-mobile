import { z } from 'zod';

import { WALK_TYPES } from '@/features/pricing';
import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { WALK_STATUSES, type Walk, type WalkDraft } from '../model/types';

export const walkSchema = z.object({
  id: z.string(),
  status: z.enum(WALK_STATUSES),
  petIds: z.array(z.string()),
  walkType: z.enum(WALK_TYPES),
  durationMinutes: z.number().int(),
  pickupAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  scheduledFor: z.string(),
  notes: z.string().nullable(),
  currency: z.string().length(3),
  total: z.number(),
  commission: z.number(),
  walkerPayout: z.number(),
  walkerId: z.string().nullable(),
  requestedAt: z.string(),
}) satisfies z.ZodType<Walk>;

/** RF-007 — POST /api/v1/walks */
export async function requestWalk(draft: WalkDraft, client: HttpClient = httpClient): Promise<Walk> {
  const { data } = await client.post('/api/v1/walks', draft, walkSchema);
  return data;
}

/** RF-007 — GET /api/v1/walks: the walks of the current owner, newest first. */
export async function listMyWalks(client: HttpClient = httpClient): Promise<Walk[]> {
  const { data } = await client.get('/api/v1/walks', z.array(walkSchema));
  return data;
}

/** RF-007 — GET /api/v1/walks/{id} */
export async function getWalk(id: string, client: HttpClient = httpClient): Promise<Walk> {
  const { data } = await client.get(`/api/v1/walks/${encodeURIComponent(id)}`, walkSchema);
  return data;
}

/** RF-007 — POST /api/v1/walks/{id}/cancel */
export async function cancelWalk(id: string, client: HttpClient = httpClient): Promise<Walk> {
  const { data } = await client.post(`/api/v1/walks/${encodeURIComponent(id)}/cancel`, {}, walkSchema);
  return data;
}
