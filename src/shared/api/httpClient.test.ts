import { z } from 'zod';

import { setSession } from '@/shared/auth/session';

import { ApiError } from './ApiError';
import { createHttpClient } from './httpClient';

afterEach(() => setSession(null));

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
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(envelope({ warnings }))),
    );

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
    expect(error).toMatchObject({
      status: 400,
      code: 'Pagination.InvalidPage',
      message: 'Bad page',
      errors,
      traceId: 'trace-1',
    });
  });

  it('throws ApiError when the server does not answer with an envelope', async () => {
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })),
    );

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, code: 'Http.UnexpectedResponse' });
    expect((error as ApiError).message).toBe('El servidor no respondió como se esperaba. Intenta de nuevo.');
    expect((error as ApiError).message).not.toContain('502');
  });

  it('throws an ApiError with a generic Spanish message when success is true but data is null', async () => {
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(envelope({ data: null }))),
    );

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).errors).toHaveLength(1);
    expect((error as ApiError).message).toBe('El servidor no respondió como se esperaba. Intenta de nuevo.');
  });

  it('throws when data does not match the contract', async () => {
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(envelope({ data: { id: 'nope' } }))),
    );

    await expect(client.get('/x', schema)).rejects.toThrow();
  });
});

describe('httpClient headers', () => {
  it('adds the extra headers of every request', async () => {
    const fetchFn = jest.fn().mockImplementation(async () => jsonResponse(envelope()));
    const client = createHttpClient('http://api.test', fetchFn, () => ({ 'X-Custom': 'value' }));

    await client.get('/x', schema);
    await client.post('/x', {}, schema);

    for (const [, init] of fetchFn.mock.calls) {
      expect((init as RequestInit).headers).toMatchObject({ 'X-Custom': 'value' });
    }
  });

  it('sends the session access token as a Bearer header by default (RNF-002)', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createHttpClient('http://api.test', fetchFn);

    await client.get('/x', schema);

    expect((fetchFn.mock.calls[0]![1] as RequestInit).headers).toMatchObject({ Authorization: 'Bearer at-1' });
  });

  it('sends no Authorization header when there is no session', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createHttpClient('http://api.test', fetchFn);

    await client.get('/x', schema);

    expect((fetchFn.mock.calls[0]![1] as RequestInit).headers).not.toHaveProperty('Authorization');
  });
});

describe('httpClient silent refresh on 401', () => {
  it('refreshes once and retries the original request with the new token', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    let requestsToX = 0;
    const fetchFn = jest.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api/v1/auth/refresh')) {
        return jsonResponse(envelope({ data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 } }));
      }
      requestsToX += 1;
      return requestsToX === 1
        ? jsonResponse(envelope({ success: false, data: null, errors: [] }), 401)
        : jsonResponse(envelope());
    });
    const client = createHttpClient('http://api.test', fetchFn);

    const result = await client.get('/x', schema);

    expect(result.data).toEqual({ id: 7 });
    const callsToX = fetchFn.mock.calls.filter(([input]) => String(input).endsWith('/x'));
    expect(callsToX).toHaveLength(2);
    expect((callsToX[1]![1] as RequestInit).headers).toMatchObject({ Authorization: 'Bearer at-2' });
  });

  it('refreshes once for concurrent 401s and retries both requests with the new token', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/api/v1/auth/refresh')) {
        return jsonResponse(envelope({ data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 } }));
      }
      const authorization = (init?.headers as Record<string, string>).Authorization;
      return authorization === 'Bearer at-2'
        ? jsonResponse(envelope())
        : jsonResponse(envelope({ success: false, data: null, errors: [] }), 401);
    });
    const client = createHttpClient('http://api.test', fetchFn);

    const [a, b] = await Promise.all([client.get('/a', schema), client.get('/b', schema)]);

    expect(a.data).toEqual({ id: 7 });
    expect(b.data).toEqual({ id: 7 });
    const refreshCalls = fetchFn.mock.calls.filter(([input]) => String(input).endsWith('/api/v1/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
    const retries = fetchFn.mock.calls.filter(
      ([, init]) =>
        (init as RequestInit).headers &&
        ((init as RequestInit).headers as Record<string, string>).Authorization === 'Bearer at-2',
    );
    expect(retries).toHaveLength(2);
  });

  it('gives up after one failed refresh and surfaces the original 401', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/api/v1/auth/refresh')) {
        return jsonResponse(envelope({ success: false, data: null, errors: [] }), 401);
      }
      return jsonResponse(envelope({ success: false, data: null, errors: [] }), 401);
    });
    const client = createHttpClient('http://api.test', fetchFn);

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
  });

  it('refreshes once on a 403 (token without the new role yet) and retries with the new token', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/api/v1/auth/refresh')) {
        return jsonResponse(envelope({ data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 } }));
      }
      const authorization = (init?.headers as Record<string, string>).Authorization;
      return authorization === 'Bearer at-2'
        ? jsonResponse(envelope())
        : jsonResponse(envelope({ success: false, data: null, errors: [] }), 403);
    });
    const client = createHttpClient('http://api.test', fetchFn);

    const result = await client.get('/x', schema);

    expect(result.data).toEqual({ id: 7 });
    expect(fetchFn.mock.calls.filter(([input]) => String(input).endsWith('/x'))).toHaveLength(2);
  });

  it('shares one refresh between concurrent 403s', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/api/v1/auth/refresh')) {
        return jsonResponse(envelope({ data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 } }));
      }
      const authorization = (init?.headers as Record<string, string>).Authorization;
      return authorization === 'Bearer at-2'
        ? jsonResponse(envelope())
        : jsonResponse(envelope({ success: false, data: null, errors: [] }), 403);
    });
    const client = createHttpClient('http://api.test', fetchFn);

    await Promise.all([client.get('/a', schema), client.get('/b', schema)]);

    expect(fetchFn.mock.calls.filter(([input]) => String(input).endsWith('/api/v1/auth/refresh'))).toHaveLength(1);
  });

  it('retries a 403 only once when the new token is still forbidden', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/api/v1/auth/refresh')) {
        return jsonResponse(envelope({ data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 } }));
      }
      return jsonResponse(envelope({ success: false, data: null, errors: [] }), 403);
    });
    const client = createHttpClient('http://api.test', fetchFn);

    const error = await client.get('/x', schema).catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 403 });
    expect(fetchFn.mock.calls.filter(([input]) => String(input).endsWith('/x'))).toHaveLength(2);
  });

  it('does not attempt a refresh when there is no session to begin with', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(jsonResponse(envelope({ success: false, data: null, errors: [] }), 401));
    const client = createHttpClient('http://api.test', fetchFn);

    await client.get('/x', schema).catch(() => undefined);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe('httpClient.post', () => {
  it('sends the body as JSON and unwraps the envelope', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createHttpClient('http://api.test', fetchFn);

    const result = await client.post('/api/v1/things', { name: 'Luna' }, schema);

    expect(fetchFn).toHaveBeenCalledWith('http://api.test/api/v1/things', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Luna' }),
    });
    expect(result.data).toEqual({ id: 7 });
  });

  it('throws ApiError with the validation errors when success is false', async () => {
    const errors = [{ code: 'Pets.InvalidWeight', message: 'El peso debe estar entre 0.5 y 100 kg.' }];
    const client = createHttpClient(
      'http://api.test',
      jest.fn().mockResolvedValue(jsonResponse(envelope({ success: false, data: null, errors }), 400)),
    );

    const error = await client.post('/x', {}, schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'Pets.InvalidWeight', errors });
  });
});
