import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { WALK_PARTIES, type WalkMessage } from '../model/types';

export const walkMessageSchema = z.object({
  id: z.string(),
  sentBy: z.enum(WALK_PARTIES),
  text: z.string(),
  sentAt: z.string(),
}) satisfies z.ZodType<WalkMessage>;

/** RF-013 — GET /api/v1/walks/{id}/messages, in the order they were written. */
export async function listMessages(walkId: string, client: HttpClient = httpClient): Promise<WalkMessage[]> {
  const { data } = await client.get(`/api/v1/walks/${encodeURIComponent(walkId)}/messages`, z.array(walkMessageSchema));
  return data;
}

/** RF-013 — POST /api/v1/walks/{id}/messages */
export async function sendMessage(walkId: string, text: string, client: HttpClient = httpClient): Promise<WalkMessage> {
  const { data } = await client.post(
    `/api/v1/walks/${encodeURIComponent(walkId)}/messages`,
    { text },
    walkMessageSchema,
  );
  return data;
}
