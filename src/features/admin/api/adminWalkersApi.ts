import { z } from 'zod';

import type { WalkerProfile } from '@/features/walker';
import { httpClient, type HttpClient } from '@/shared/api/httpClient';

const walkerProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  documentType: z.enum(['CC', 'CE', 'PP']),
  documentLast4: z.string(),
  phone: z.string(),
  experience: z.string().nullable(),
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  rejectionReason: z.string().nullable(),
  registeredAt: z.string(),
}) satisfies z.ZodType<WalkerProfile>;

/** RF-003 — GET /api/v1/admin/walkers?status=Pending: the queue an admin verifies. */
export async function listPendingWalkers(client: HttpClient = httpClient): Promise<WalkerProfile[]> {
  const { data } = await client.get('/api/v1/admin/walkers', z.array(walkerProfileSchema), { status: 'Pending' });
  return data;
}

/** RF-003 — POST /api/v1/admin/walkers/{id}/approve. */
export async function approveWalker(id: string, client: HttpClient = httpClient): Promise<WalkerProfile> {
  const { data } = await client.post(
    `/api/v1/admin/walkers/${encodeURIComponent(id)}/approve`,
    {},
    walkerProfileSchema,
  );
  return data;
}

/** RF-003 — POST /api/v1/admin/walkers/{id}/reject. */
export async function rejectWalker(
  id: string,
  reason: string,
  client: HttpClient = httpClient,
): Promise<WalkerProfile> {
  const { data } = await client.post(
    `/api/v1/admin/walkers/${encodeURIComponent(id)}/reject`,
    { reason },
    walkerProfileSchema,
  );
  return data;
}
