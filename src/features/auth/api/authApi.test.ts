import { createHttpClient } from '@/shared/api/httpClient';
import { getSession, setSession } from '@/shared/auth/session';

import {
  confirmEmail,
  forgotPassword,
  googleLogin,
  login,
  logout,
  register,
  resendConfirmation,
  resetPassword,
} from './authApi';

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

  it('confirms the account with POST /api/v1/auth/confirm, the email and the 6-digit code', async () => {
    const fetchFn = respond(envelope(true));

    await confirmEmail('ana@mail.com', '004821', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/confirm',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'ana@mail.com', code: '004821' }),
      }),
    );
  });

  it('asks for a new code with POST /api/v1/auth/resend-confirmation', async () => {
    const fetchFn = respond(envelope(true));

    await resendConfirmation('ana@mail.com', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/resend-confirmation',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'ana@mail.com' }) }),
    );
  });

  it('asks for a recovery code with POST /api/v1/auth/forgot-password', async () => {
    const fetchFn = respond(envelope(true));

    await forgotPassword('ana@mail.com', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/forgot-password',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'ana@mail.com' }) }),
    );
  });

  it('sets the new password with POST /api/v1/auth/reset-password', async () => {
    const fetchFn = respond(envelope(true));

    await resetPassword('ana@mail.com', '004821', 'Nueva1234', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'ana@mail.com', code: '004821', newPassword: 'Nueva1234' }),
      }),
    );
  });

  it('logs in and opens the session from POST /api/v1/auth/login', async () => {
    const fetchFn = respond(envelope({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));

    const session = await login('ana@mail.com', 'Clave123!', createHttpClient('http://api', fetchFn));

    expect(session).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
    expect(getSession()).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
  });

  describe('logout', () => {
    const openSession = () => setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });

    it('clears the session right away, before the server answers', () => {
      openSession();

      void logout(createHttpClient('http://api', jest.fn().mockReturnValue(new Promise(() => {}))));

      expect(getSession()).toBeNull();
    });

    it('revokes the refresh token with POST /api/v1/auth/logout', async () => {
      openSession();
      const fetchFn = respond(envelope(true));

      await logout(createHttpClient('http://api', fetchFn));

      expect(fetchFn).toHaveBeenCalledWith(
        'http://api/api/v1/auth/logout',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'rt' }) }),
      );
    });

    it('still signs out, without throwing, when the request fails', async () => {
      openSession();
      const fetchFn = jest.fn().mockRejectedValue(new Error('offline'));

      await expect(logout(createHttpClient('http://api', fetchFn))).resolves.toBeUndefined();

      expect(getSession()).toBeNull();
    });

    it('sends nothing when there is no session', async () => {
      setSession(null);
      const fetchFn = respond(envelope(true));

      await logout(createHttpClient('http://api', fetchFn));

      expect(fetchFn).not.toHaveBeenCalled();
    });
  });
  it('signs in with Google with POST /api/v1/auth/login/google and the idToken, and keeps the session', async () => {
    const fetchFn = respond(envelope({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));

    const session = await googleLogin('google-id-token', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/auth/login/google',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ idToken: 'google-id-token' }) }),
    );
    expect(session.accessToken).toBe('at');
    expect(getSession()?.refreshToken).toBe('rt');
  });
});
