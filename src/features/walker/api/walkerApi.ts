import { z } from 'zod';

import { WALK_TYPES } from '@/features/pricing';
import { walkSchema, type Walk } from '@/features/walks';
import { httpClient, type HttpClient } from '@/shared/api/httpClient';
import type { Coordinates } from '@/shared/location/getCurrentLocation';

import type { AvailableWalk } from '../model/types';

export const availableWalkSchema = z.object({
  id: z.string(),
  walkType: z.enum(WALK_TYPES),
  durationMinutes: z.number().int(),
  petCount: z.number().int(),
  pickupAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  scheduledFor: z.string(),
  currency: z.string().length(3),
  walkerPayout: z.number(),
  distanceKm: z.number().nullable(),
}) satisfies z.ZodType<AvailableWalk>;

/** RF-007 — GET /api/v1/walks/available. With a position, the nearest come first. */
export async function listAvailableWalks(
  near: Coordinates | null,
  client: HttpClient = httpClient,
): Promise<AvailableWalk[]> {
  const { data } = await client.get('/api/v1/walks/available', z.array(availableWalkSchema), near ?? undefined);
  return data;
}

/** RF-007 — POST /api/v1/walks/{id}/accept */
export async function acceptWalk(id: string, client: HttpClient = httpClient): Promise<Walk> {
  const { data } = await client.post(`/api/v1/walks/${encodeURIComponent(id)}/accept`, {}, walkSchema);
  return data;
}

/** RF-008 — POST /api/v1/walks/{id}/start: the walker picked the dogs up. */
export async function startWalk(id: string, client: HttpClient = httpClient): Promise<Walk> {
  const { data } = await client.post(`/api/v1/walks/${encodeURIComponent(id)}/start`, {}, walkSchema);
  return data;
}

/** RF-008 — POST /api/v1/walks/{id}/finish: the walker brought the dogs back. */
export async function finishWalk(id: string, client: HttpClient = httpClient): Promise<Walk> {
  const { data } = await client.post(`/api/v1/walks/${encodeURIComponent(id)}/finish`, {}, walkSchema);
  return data;
}

/** RF-007 — GET /api/v1/walks/assigned: the walks this walker accepted. */
export async function listAssignedWalks(client: HttpClient = httpClient): Promise<Walk[]> {
  const { data } = await client.get('/api/v1/walks/assigned', z.array(walkSchema));
  return data;
}
