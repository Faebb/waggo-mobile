import { createHttpClient } from '@/shared/api/httpClient';

import { listWalkAlerts, raiseEmergency } from './alertsApi';

const alert = {
  id: 'alert-1',
  kind: 'Emergency',
  raisedBy: 'Walker',
  message: 'Luna se soltó',
  latitude: 4.64,
  longitude: -74.062,
  raisedAt: '2026-09-30T15:10:00+00:00',
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

describe('alertsApi (RF-012)', () => {
  it('raises an emergency with POST /api/v1/walks/{id}/emergency', async () => {
    const fetchFn = respond(alert);
    const draft = { message: 'Luna se soltó', latitude: 4.64, longitude: -74.062 };

    await expect(raiseEmergency('walk-1', draft, createHttpClient('http://api', fetchFn))).resolves.toEqual(alert);
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks/walk-1/emergency',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(draft) }),
    );
  });

  it('lists the alerts of a walk', async () => {
    const fetchFn = respond([alert]);

    await expect(listWalkAlerts('walk-1', createHttpClient('http://api', fetchFn))).resolves.toEqual([alert]);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/walk-1/alerts', expect.anything());
  });
});
