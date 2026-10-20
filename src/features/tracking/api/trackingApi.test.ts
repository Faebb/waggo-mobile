import { createHttpClient } from '@/shared/api/httpClient';

import { getRoute, recordTrack } from './trackingApi';

const route = {
  points: [{ latitude: 4.6361, longitude: -74.0645, recordedAt: '2026-09-30T15:00:00+00:00' }],
  distanceKm: 0.99,
  elapsedMinutes: 18,
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

const respond = (data: unknown) =>
  jest.fn().mockResolvedValue(new Response(JSON.stringify(envelope(data)), { status: 200 }));

describe('trackingApi (RF-008)', () => {
  it('reads the route of a walk', async () => {
    const fetchFn = respond(route);

    await expect(getRoute('walk-1', createHttpClient('http://api', fetchFn))).resolves.toEqual(route);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/walk-1/track', expect.anything());
  });

  it('sends a batch of positions', async () => {
    const fetchFn = respond(2);
    const points = [
      { latitude: 4.6361, longitude: -74.0645, recordedAt: '2026-09-30T15:00:00.000Z' },
      { latitude: 4.6405, longitude: -74.0645, recordedAt: '2026-09-30T15:00:15.000Z' },
    ];

    await expect(recordTrack('walk-1', points, createHttpClient('http://api', fetchFn))).resolves.toBe(2);
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks/walk-1/track',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ points }) }),
    );
  });
});
