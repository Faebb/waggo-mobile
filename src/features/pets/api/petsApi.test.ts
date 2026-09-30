import { createHttpClient } from '@/shared/api/httpClient';

import { listMyPets, registerPet } from './petsApi';

const luna = {
  id: '0b3c5f7e-1111-4a4a-8b8b-000000000001',
  name: 'Luna',
  breed: 'Criolla',
  size: 'Medium',
  birthDate: '2021-05-10',
  weightKg: 14.5,
  medicalNotes: 'Alérgica al pollo',
};

const envelope = (data: unknown) => ({
  success: true,
  data,
  pagination: null,
  errors: [],
  warnings: [],
  infos: [],
  traceId: 't',
});

const respond = (body: unknown) => jest.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

describe('petsApi (RF-004)', () => {
  it('lists the owner pets from GET /api/v1/pets', async () => {
    const fetchFn = respond(envelope([luna]));

    const pets = await listMyPets(createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/pets', expect.objectContaining({ method: 'GET' }));
    expect(pets).toEqual([luna]);
  });

  it('registers a pet with POST /api/v1/pets and returns it', async () => {
    const fetchFn = respond(envelope(luna));
    const draft = { name: 'Luna', size: 'Medium' as const, breed: 'Criolla', weightKg: 14.5 };

    const pet = await registerPet(draft, createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/pets',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(draft) }),
    );
    expect(pet).toEqual(luna);
  });

  it('accepts pets without optional data', async () => {
    const max = { ...luna, name: 'Max', breed: null, birthDate: null, weightKg: null, medicalNotes: null };

    const pets = await listMyPets(createHttpClient('http://api', respond(envelope([max]))));

    expect(pets[0]).toEqual(max);
  });

  it('rejects a response with an unknown size (contract changed)', async () => {
    await expect(
      listMyPets(createHttpClient('http://api', respond(envelope([{ ...luna, size: 'Giant' }])))),
    ).rejects.toThrow();
  });
});
