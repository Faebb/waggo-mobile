import { z } from 'zod';

import { ApiError } from '@/shared/api/ApiError';
import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { DOCUMENT_TYPES, VERIFICATION_STATUSES, type WalkerDraft, type WalkerProfile } from '../model/types';

export const walkerProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  documentType: z.enum(DOCUMENT_TYPES),
  documentLast4: z.string(),
  phone: z.string(),
  experience: z.string().nullable(),
  status: z.enum(VERIFICATION_STATUSES),
  rejectionReason: z.string().nullable(),
  registeredAt: z.string(),
}) satisfies z.ZodType<WalkerProfile>;

/** RF-002/RF-003 — GET /api/v1/walkers/me. `null` when the user has not registered as a walker yet. */
export async function getMyWalkerProfile(client: HttpClient = httpClient): Promise<WalkerProfile | null> {
  try {
    const { data } = await client.get('/api/v1/walkers/me', walkerProfileSchema);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** RF-002 — POST /api/v1/walkers/me: the profile starts pending verification. */
export async function registerWalker(draft: WalkerDraft, client: HttpClient = httpClient): Promise<WalkerProfile> {
  const { data } = await client.post('/api/v1/walkers/me', draft, walkerProfileSchema);
  return data;
}
