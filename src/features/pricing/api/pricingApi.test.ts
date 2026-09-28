import { ApiError } from '@/shared/api/ApiError';
import { createHttpClient } from '@/shared/api/httpClient';

import { getFareQuote } from './pricingApi';

const quote = {
  walkType: 'Individual',
  durationMinutes: 60,
  currency: 'COP',
  total: 23000,
  commission: 4600,
  walkerPayout: 18400,
};

const respond = (body: unknown, status = 200) =>
  jest.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('getFareQuote', () => {
  it('calls GET /api/v1/pricing/quote with walk type and duration', async () => {
    const fetchFn = respond(quote);

    await getFareQuote({ walkType: 'Individual', durationMinutes: 60 }, createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/pricing/quote?walkType=Individual&durationMinutes=60',
      expect.anything(),
    );
  });

  it('returns the quote from the API', async () => {
    const result = await getFareQuote(
      { walkType: 'Individual', durationMinutes: 60 },
      createHttpClient('http://api', respond(quote)),
    );

    expect(result).toEqual(quote);
  });

  it('rejects a response with an unknown walk type (contract check)', async () => {
    const client = createHttpClient('http://api', respond({ ...quote, walkType: 'Skateboard' }));

    await expect(getFareQuote({ walkType: 'Individual', durationMinutes: 60 }, client)).rejects.toThrow();
  });

  it('propagates business errors from the API', async () => {
    const client = createHttpClient('http://api', respond({ code: 'Pricing.InvalidDuration', detail: 'Invalid' }, 400));

    await expect(getFareQuote({ walkType: 'Individual', durationMinutes: 60 }, client)).rejects.toBeInstanceOf(ApiError);
  });
});
