import type * as SessionModule from './session';
import { getSession, setSession } from './session';
import { tryRefreshSession } from './refreshSession';

jest.mock('./session', () => {
  const actual = jest.requireActual<typeof SessionModule>('./session');
  return { ...actual, setSession: jest.fn(actual.setSession) };
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('tryRefreshSession', () => {
  afterEach(() => {
    setSession(null);
    jest.mocked(setSession).mockClear();
  });

  it('returns false without calling fetch when there is no session', async () => {
    const fetchFn = jest.fn();

    const result = await tryRefreshSession('http://api.test', fetchFn);

    expect(result).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('rotates the session on a successful response', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 },
      }),
    );

    const result = await tryRefreshSession('http://api.test', fetchFn);

    expect(result).toBe(true);
    expect(getSession()).toMatchObject({ accessToken: 'at-2', refreshToken: 'rt-2' });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/auth/refresh',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'rt-1' }) }),
    );
  });

  it('clears the session when the API rejects the refresh token', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({ success: false, data: null, errors: [] }, 401));

    const result = await tryRefreshSession('http://api.test', fetchFn);

    expect(result).toBe(false);
    expect(getSession()).toBeNull();
  });

  it('clears the session when fetch itself fails', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockRejectedValue(new Error('network down'));

    const result = await tryRefreshSession('http://api.test', fetchFn);

    expect(result).toBe(false);
    expect(getSession()).toBeNull();
  });

  it('shares one in-flight refresh between concurrent callers and clears it afterwards', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest
      .fn()
      .mockImplementation(async () =>
        jsonResponse({ success: true, data: { accessToken: 'at-2', refreshToken: 'rt-2', expiresInSeconds: 900 } }),
      );

    const results = await Promise.all([
      tryRefreshSession('http://api.test', fetchFn),
      tryRefreshSession('http://api.test', fetchFn),
    ]);

    expect(results).toEqual([true, true]);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await tryRefreshSession('http://api.test', fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('clears the session once when a shared refresh fails', async () => {
    setSession({ accessToken: 'at-1', refreshToken: 'rt-1', expiresAt: Date.now() + 60_000 });
    jest.mocked(setSession).mockClear();
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({ success: false, data: null, errors: [] }, 401));

    const results = await Promise.all([
      tryRefreshSession('http://api.test', fetchFn),
      tryRefreshSession('http://api.test', fetchFn),
    ]);

    expect(results).toEqual([false, false]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(setSession).toHaveBeenCalledTimes(1);
    expect(setSession).toHaveBeenCalledWith(null);
  });
});
