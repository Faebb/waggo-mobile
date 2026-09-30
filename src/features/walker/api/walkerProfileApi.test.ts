import { ApiError } from '@/shared/api/ApiError';
import { createHttpClient } from '@/shared/api/httpClient';
import { pendingWalkerProfile } from '@/test/fixtures';
import { envelopeResponse } from '@/test/mockApi';

import { getMyWalkerProfile, registerWalker } from './walkerProfileApi';

describe('walkerProfileApi (RF-002, RF-003)', () => {
  it('reads the walker profile', async () => {
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(pendingWalkerProfile));

    await expect(getMyWalkerProfile(createHttpClient('http://api', fetchFn))).resolves.toEqual(pendingWalkerProfile);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walkers/me', expect.anything());
  });

  it('answers null when the user has no walker profile yet', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(envelopeResponse(null, 404, [{ code: 'Walkers.NotFound', message: 'No encontramos' }]));

    await expect(getMyWalkerProfile(createHttpClient('http://api', fetchFn))).resolves.toBeNull();
  });

  it('keeps other failures as errors', async () => {
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(null, 500, [{ code: 'Server', message: 'Falló' }]));

    await expect(getMyWalkerProfile(createHttpClient('http://api', fetchFn))).rejects.toBeInstanceOf(ApiError);
  });

  it('registers with POST /api/v1/walkers/me', async () => {
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(pendingWalkerProfile));
    const draft = {
      fullName: 'Andrés Gómez',
      documentType: 'CC' as const,
      documentNumber: '1020304050',
      phone: '3001234567',
    };

    await registerWalker(draft, createHttpClient('http://api', fetchFn));

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api/api/v1/walkers/me');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(draft);
  });
});
