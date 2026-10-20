import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import type { Route, TrackPointDraft } from '../model/types';

export const routeSchema = z.object({
  points: z.array(z.object({ latitude: z.number(), longitude: z.number(), recordedAt: z.string() })),
  distanceKm: z.number(),
  elapsedMinutes: z.number().int(),
}) satisfies z.ZodType<Route>;

/** RF-008 — GET /api/v1/walks/{id}/track: the route so far with its distance and time. */
export async function getRoute(walkId: string, client: HttpClient = httpClient): Promise<Route> {
  const { data } = await client.get(`/api/v1/walks/${encodeURIComponent(walkId)}/track`, routeSchema);
  return data;
}

/** RF-008 — POST /api/v1/walks/{id}/track: a batch of positions. Returns how many were saved. */
export async function recordTrack(
  walkId: string,
  points: TrackPointDraft[],
  client: HttpClient = httpClient,
): Promise<number> {
  const { data } = await client.post(`/api/v1/walks/${encodeURIComponent(walkId)}/track`, { points }, z.number());
  return data;
}
