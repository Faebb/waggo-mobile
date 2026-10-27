import { createHttpClient } from '@/shared/api/httpClient';
import { setSession } from '@/shared/auth/session';

import { changeMyPassword, getMyProfile, updateMyProfile } from './profileApi';

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

describe('profileApi (perfil de usuario)', () => {
  it('gets my profile from GET /api/v1/users/me', async () => {
    const fetchFn = respond(envelope({ id: 'u1', email: 'ana@mail.com', fullName: null, phone: null }));

    const profile = await getMyProfile(createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/users/me', expect.objectContaining({ method: 'GET' }));
    expect(profile).toEqual({ id: 'u1', email: 'ana@mail.com', fullName: null, phone: null });
  });

  it('updates my profile with PUT /api/v1/users/me', async () => {
    const updated = { id: 'u1', email: 'ana@mail.com', fullName: 'Ana Pérez', phone: '3001234567' };
    const fetchFn = respond(envelope(updated));

    const profile = await updateMyProfile(
      { fullName: 'Ana Pérez', phone: '3001234567' },
      createHttpClient('http://api', fetchFn),
    );

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/users/me',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ fullName: 'Ana Pérez', phone: '3001234567' }) }),
    );
    expect(profile).toEqual(updated);
  });

  it('changes my password with PUT /api/v1/users/me/password, sending this session refresh token', async () => {
    setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });
    const fetchFn = respond(envelope(true));

    await changeMyPassword('Actual123', 'Nueva1234', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/users/me/password',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ currentPassword: 'Actual123', newPassword: 'Nueva1234', refreshToken: 'rt' }),
      }),
    );
    setSession(null);
  });
});
