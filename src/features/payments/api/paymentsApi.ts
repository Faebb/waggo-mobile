import { z } from 'zod';

import { ApiError } from '@/shared/api/ApiError';
import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { PAYMENT_STATUSES, type WalkerEarnings, type WalkPayment } from '../model/types';

export const walkPaymentSchema = z.object({
  walkId: z.string(),
  status: z.enum(PAYMENT_STATUSES),
  currency: z.string().length(3),
  total: z.number(),
  commission: z.number(),
  walkerPayout: z.number(),
  heldAt: z.string(),
  capturedAt: z.string().nullable(),
  releasedAt: z.string().nullable(),
}) satisfies z.ZodType<WalkPayment>;

export const walkerEarningsSchema = z.object({
  currency: z.string().length(3).nullable(),
  total: z.number(),
  walks: z.array(z.object({ walkId: z.string(), walkerPayout: z.number(), capturedAt: z.string() })),
}) satisfies z.ZodType<WalkerEarnings>;

/**
 * RF-016 — GET /api/v1/walks/{id}/payment. `null` when the walk has no payment (requested before payments
 * existed); a walk the user cannot see is still an error.
 */
export async function getWalkPayment(walkId: string, client: HttpClient = httpClient): Promise<WalkPayment | null> {
  try {
    const { data } = await client.get(`/api/v1/walks/${encodeURIComponent(walkId)}/payment`, walkPaymentSchema);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'Payments.NotFound') {
      return null;
    }
    throw error;
  }
}

/** RF-017 — GET /api/v1/payments/earnings: what the walker earned, the most recent walk first. */
export async function getMyEarnings(client: HttpClient = httpClient): Promise<WalkerEarnings> {
  const { data } = await client.get('/api/v1/payments/earnings', walkerEarningsSchema);
  return data;
}
