import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { PET_SIZES, type Pet, type PetDraft } from '../model/types';

export const petSchema = z.object({
  id: z.string(),
  name: z.string(),
  breed: z.string().nullable(),
  size: z.enum(PET_SIZES),
  birthDate: z.string().nullable(),
  weightKg: z.number().nullable(),
  medicalNotes: z.string().nullable(),
}) satisfies z.ZodType<Pet>;

/** RF-004 — GET /api/v1/pets: the dogs of the current owner. */
export async function listMyPets(client: HttpClient = httpClient): Promise<Pet[]> {
  const { data } = await client.get('/api/v1/pets', z.array(petSchema));
  return data;
}

/** RF-004 — POST /api/v1/pets */
export async function registerPet(draft: PetDraft, client: HttpClient = httpClient): Promise<Pet> {
  const { data } = await client.post('/api/v1/pets', draft, petSchema);
  return data;
}
