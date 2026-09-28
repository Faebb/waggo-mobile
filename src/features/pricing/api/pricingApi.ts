import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { WALK_TYPES, type FareQuote, type WalkType } from '../model/types';

export const fareQuoteSchema = z.object({
  walkType: z.enum(WALK_TYPES),
  durationMinutes: z.number().int(),
  currency: z.string().length(3),
  total: z.number().nonnegative(),
  commission: z.number().nonnegative(),
  walkerPayout: z.number().nonnegative(),
}) satisfies z.ZodType<FareQuote>;

export type FareQuoteRequest = { walkType: WalkType; durationMinutes: number };

/** RF-019 — GET /api/v1/pricing/quote */
export async function getFareQuote(request: FareQuoteRequest, client: HttpClient = httpClient): Promise<FareQuote> {
  const { data } = await client.get('/api/v1/pricing/quote', fareQuoteSchema, request);
  return data;
}
