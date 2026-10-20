import { getSession, setSession } from './session';
import { tryRefreshSession } from './refreshSession';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('tryRefreshSession', () => {
  afterEach(() => setSession(null));

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
});
