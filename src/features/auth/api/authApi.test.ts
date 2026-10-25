import { createHttpClient } from '@/shared/api/httpClient';
import { getSession, setSession } from '@/shared/auth/session';

import { confirmEmail, login, logout, register } from './authApi';

const envelope = (data: unknown) => ({
  success: true,
  data,
  pagination: null,
  errors: [],
  warnings: [],
  infos: [],
  traceId: 't',
});

const respond = (body: unknown) => jest.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

describe('authApi (RF-001, RF-005)', () => {
  afterEach(() => setSession(null));

  it('registers an account with POST /api/v1/auth/register', async () => {
    const fetchFn = respond(envelope({ id: 'user-1', email: 'ana@mail.com' }));

    const account = await register('ana@mail.com', 'Clave123!', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/register',
      expect.objectContaining({ body: JSON.stringify({ email: 'ana@mail.com', password: 'Clave123!' }) }),
    );
    expect(account).toEqual({ id: 'user-1', email: 'ana@mail.com' });
  });

  it('confirms the account with GET /api/v1/auth/confirm?token=', async () => {
    const fetchFn = respond(envelope(true));

    await confirmEmail('raw-token', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/confirm?token=raw-token',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('logs in and opens the session from POST /api/v1/auth/login', async () => {
    const fetchFn = respond(envelope({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));

    const session = await login('ana@mail.com', 'Clave123!', createHttpClient('http://api', fetchFn));

    expect(session).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
    expect(getSession()).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
  });

  it('logout clears the session', () => {
    setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });

    logout();

    expect(getSession()).toBeNull();
  });
});
