import { z } from 'zod';

import { ApiError } from './ApiError';
import { createHttpClient } from './httpClient';

const schema = z.object({ id: z.number() });

function envelope(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: { id: 7 },
    pagination: null,
    errors: [],
    warnings: [],
    infos: [],
    traceId: 'trace-1',
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('httpClient.get', () => {
  it('builds the URL from base url, path and query params', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createHttpClient('http://api.test/', fetchFn);

    await client.get('/api/v1/things', schema, { a: 'x', b: 2, skip: undefined });

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/things?a=x&b=2',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('unwraps the WaggoApiResponse envelope', async () => {
    const warnings = [{ code: 'W.1', message: 'careful' }];
    const client = createHttpClient('http://api.test', jest.fn().mockResolvedValue(jsonResponse(envelope({ warnings }))));

    const result = await client.get('/x', schema);

    expect(result).toEqual({ data: { id: 7 }, pagination: null, warnings, infos: [], traceId: 'trace-1' });
  });

  it('returns the pagination when the endpoint pages', async () => {
    const pagination = { page: 2, pageSize: 20, totalItems: 45, totalPages: 3, hasPrevious: true, hasNext: true };
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(envelope({ data: [{ id: 1 }], pagination }))),
    );

    const result = await client.get('/x', z.array(schema));

    expect(result.pagination).toEqual(pagination);
  });

  it('throws ApiError with every error of the envelope when success is false', async () => {
    const errors = [
      { code: 'Pagination.InvalidPage', message: 'Bad page', field: 'page' },
      { code: 'Pagination.InvalidPageSize', message: 'Bad size', field: 'pageSize' },
    ];
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(envelope({ success: false, data: null, errors }), 400)),
    );

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'Pagination.InvalidPage', message: 'Bad page', errors, traceId: 'trace-1' });
  });

  it('throws ApiError when the server does not answer with an envelope', async () => {
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })),
    );

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, code: 'Http.502' });
  });

  it('throws when data does not match the contract', async () => {
    const client = createHttpClient('http://api.test', jest.fn().mockResolvedValue(jsonResponse(envelope({ data: { id: 'nope' } }))));

    await expect(client.get('/x', schema)).rejects.toThrow();
  });
});
