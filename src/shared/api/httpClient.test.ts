import { z } from 'zod';

import { ApiError } from './ApiError';
import { createHttpClient } from './httpClient';

const schema = z.object({ id: z.number() });

function jsonResponse(body: unknown, status = 200, contentType = 'application/json') {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });
}

describe('httpClient.get', () => {
  it('builds the URL from base url, path and query params', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    const client = createHttpClient('http://api.test/', fetchFn);

    await client.get('/api/v1/things', schema, { a: 'x', b: 2 });

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/things?a=x&b=2',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns the parsed body when the response is valid', async () => {
    const client = createHttpClient('http://api.test', jest.fn().mockResolvedValue(jsonResponse({ id: 7 })));

    await expect(client.get('/x', schema)).resolves.toEqual({ id: 7 });
  });

  it('throws ApiError with the ProblemDetails code on 4xx', async () => {
    const problem = { title: 'Pricing.InvalidDuration', detail: 'Bad duration', status: 400, code: 'Pricing.InvalidDuration' };
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(problem, 400, 'application/problem+json')),
    );

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'Pricing.InvalidDuration', message: 'Bad duration' });
  });

  it('throws when the response does not match the contract', async () => {
    const client = createHttpClient('http://api.test', jest.fn().mockResolvedValue(jsonResponse({ id: 'nope' })));

    await expect(client.get('/x', schema)).rejects.toThrow();
  });
});
