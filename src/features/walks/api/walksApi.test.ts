import { createHttpClient } from '@/shared/api/httpClient';
import { requestedWalk } from '@/test/fixtures';

import { cancelWalk, getWalk, listMyWalks, requestWalk } from './walksApi';

const envelope = (data: unknown) => ({
  success: true,
  data,
  pagination: null,
  errors: [],
  warnings: [],
  infos: [],
  traceId: 't',
});

const respond = (data: unknown) =>
  jest.fn().mockResolvedValue(new Response(JSON.stringify(envelope(data)), { status: 200 }));

describe('walksApi (RF-007)', () => {
  it('requests a walk with POST /api/v1/walks', async () => {
    const fetchFn = respond(requestedWalk);
    const draft = {
      petIds: ['pet-luna'],
      walkType: 'Individual' as const,
      durationMinutes: 60,
      pickupAddress: 'Cra 7 # 45-10, Bogotá',
      latitude: 4.6361,
      longitude: -74.0645,
      scheduledFor: null,
      notes: 'Timbre dañado',
    };

    const walk = await requestWalk(draft, createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(draft) }),
    );
    expect(walk).toEqual(requestedWalk);
  });

  it('lists my walks with GET /api/v1/walks', async () => {
    const fetchFn = respond([requestedWalk]);

    await expect(listMyWalks(createHttpClient('http://api', fetchFn))).resolves.toEqual([requestedWalk]);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks', expect.objectContaining({ method: 'GET' }));
  });

  it('reads one walk with GET /api/v1/walks/{id}', async () => {
    const fetchFn = respond(requestedWalk);

    await getWalk('walk-1', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/walk-1', expect.anything());
  });

  it('cancels with POST /api/v1/walks/{id}/cancel', async () => {
    const fetchFn = respond({ ...requestedWalk, status: 'Cancelled' });

    const walk = await cancelWalk('walk-1', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks/walk-1/cancel',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(walk.status).toBe('Cancelled');
  });

  it('rejects an unknown status (contract changed)', async () => {
    await expect(
      getWalk('walk-1', createHttpClient('http://api', respond({ ...requestedWalk, status: 'Teleported' }))),
    ).rejects.toThrow();
  });
});
