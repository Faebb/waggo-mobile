import { createHttpClient } from '@/shared/api/httpClient';
import { acceptedWalk, availableWalk } from '@/test/fixtures';

import { acceptWalk, listAssignedWalks, listAvailableWalks } from './walkerApi';

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

describe('walkerApi (RF-007)', () => {
  it('lists the open requests without a position', async () => {
    const fetchFn = respond([availableWalk]);

    await expect(listAvailableWalks(null, createHttpClient('http://api', fetchFn))).resolves.toEqual([availableWalk]);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/available', expect.anything());
  });

  it('sends the position to get the nearest first', async () => {
    const fetchFn = respond([{ ...availableWalk, distanceKm: 1.1 }]);

    await listAvailableWalks({ latitude: 4.6361, longitude: -74.0645 }, createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks/available?latitude=4.6361&longitude=-74.0645',
      expect.anything(),
    );
  });

  it('accepts with POST /api/v1/walks/{id}/accept', async () => {
    const fetchFn = respond(acceptedWalk);

    const walk = await acceptWalk('walk-1', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks/walk-1/accept',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(walk.status).toBe('Accepted');
  });

  it('lists the accepted walks', async () => {
    const fetchFn = respond([acceptedWalk]);

    await expect(listAssignedWalks(createHttpClient('http://api', fetchFn))).resolves.toEqual([acceptedWalk]);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/assigned', expect.anything());
  });
});
