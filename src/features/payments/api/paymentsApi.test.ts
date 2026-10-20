import { ApiError } from '@/shared/api/ApiError';
import { createHttpClient } from '@/shared/api/httpClient';
import { capturedPayment, heldPayment } from '@/test/fixtures';
import { envelopeResponse } from '@/test/mockApi';

import { getMyEarnings, getWalkPayment } from './paymentsApi';

describe('paymentsApi (RF-015 – RF-018)', () => {
  it('reads the payment of a walk', async () => {
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(heldPayment));

    await expect(getWalkPayment('walk-1', createHttpClient('http://api', fetchFn))).resolves.toEqual(heldPayment);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/walk-1/payment', expect.anything());
  });

  it('answers null for a walk without payment (requested before payments existed)', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(envelopeResponse(null, 404, [{ code: 'Payments.NotFound', message: 'Sin pago' }]));

    await expect(getWalkPayment('walk-1', createHttpClient('http://api', fetchFn))).resolves.toBeNull();
  });

  it('keeps a hidden walk as an error', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(envelopeResponse(null, 404, [{ code: 'Walks.NotFound', message: 'No existe' }]));

    await expect(getWalkPayment('walk-1', createHttpClient('http://api', fetchFn))).rejects.toBeInstanceOf(ApiError);
  });

  it('reads the walker earnings', async () => {
    const earnings = {
      currency: 'COP',
      total: 18400,
      walks: [{ walkId: 'walk-1', walkerPayout: 18400, capturedAt: capturedPayment.capturedAt }],
    };
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(earnings));

    await expect(getMyEarnings(createHttpClient('http://api', fetchFn))).resolves.toEqual(earnings);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/payments/earnings', expect.anything());
  });
});
