import { createHttpClient } from '@/shared/api/httpClient';
import { getSession, setSession } from '@/shared/auth/session';

import { confirmEmail, login, logout, register, resendLoginCode, signOut, verifyLoginCode } from './authApi';

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

  it('logs in and gets a challenge from POST /api/v1/auth/login', async () => {
    const fetchFn = respond(envelope({ challengeId: 'challenge-1' }));

    const challenge = await login('ana@mail.com', 'Clave123!', createHttpClient('http://api', fetchFn));

    expect(challenge).toEqual({ challengeId: 'challenge-1' });
  });

  it('verifying the code opens the session and stores it', async () => {
    const fetchFn = respond(envelope({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));

    await verifyLoginCode('challenge-1', '048213', createHttpClient('http://api', fetchFn));

    expect(getSession()).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
  });

  it('logout clears the session', () => {
    setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });

    logout();

    expect(getSession()).toBeNull();
  });

  it('resends the code with POST /api/v1/auth/resend-code and keeps the same challenge', async () => {
    const fetchFn = respond(envelope({ challengeId: 'challenge-1' }));

    const challenge = await resendLoginCode('challenge-1', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/resend-code',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ challengeId: 'challenge-1' }) }),
    );
    expect(challenge).toEqual({ challengeId: 'challenge-1' });
  });

  it('signs out with POST /api/v1/auth/logout and the stored refresh token, then clears the session', async () => {
    setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });
    const fetchFn = respond(envelope(true));

    await signOut(createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'rt' }) }),
    );
    expect(getSession()).toBeNull();
  });

  it('clears the session even when the logout call fails', async () => {
    setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });
    const fetchFn = jest.fn().mockRejectedValue(new Error('network down'));

    await signOut(createHttpClient('http://api', fetchFn));

    expect(getSession()).toBeNull();
  });

  it('only clears the session when there is none to revoke', async () => {
    const fetchFn = jest.fn();

    await signOut(createHttpClient('http://api', fetchFn));

    expect(fetchFn).not.toHaveBeenCalled();
  });
});
