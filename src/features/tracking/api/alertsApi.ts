import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { ALERT_KINDS, ALERT_PARTIES, type EmergencyDraft, type WalkAlert } from '../model/alerts';

export const walkAlertSchema = z.object({
  id: z.string(),
  kind: z.enum(ALERT_KINDS),
  raisedBy: z.enum(ALERT_PARTIES).nullable(),
  message: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  raisedAt: z.string(),
}) satisfies z.ZodType<WalkAlert>;

/** RF-012 — POST /api/v1/walks/{id}/emergency */
export async function raiseEmergency(
  walkId: string,
  draft: EmergencyDraft,
  client: HttpClient = httpClient,
): Promise<WalkAlert> {
  const { data } = await client.post(`/api/v1/walks/${encodeURIComponent(walkId)}/emergency`, draft, walkAlertSchema);
  return data;
}

/** RF-012 — GET /api/v1/walks/{id}/alerts, newest first. */
export async function listWalkAlerts(walkId: string, client: HttpClient = httpClient): Promise<WalkAlert[]> {
  const { data } = await client.get(`/api/v1/walks/${encodeURIComponent(walkId)}/alerts`, z.array(walkAlertSchema));
  return data;
}
