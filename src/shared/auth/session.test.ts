import { renderHook, waitFor } from '@testing-library/react-native';

import { getSession, setSession, useIsAdmin, useIsAuthenticated, useSession } from './session';

function tokenWithRoles(roles: string[]): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256' })}.${encode({ roles })}.signature`;
}

describe('session', () => {
  afterEach(() => setSession(null));

  it('starts signed out', () => {
    expect(getSession()).toBeNull();
  });

  it('useSession reflects the current session and updates when it changes', async () => {
    const { result } = await renderHook(() => useSession());
    expect(result.current).toBeNull();

    const session = { accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 };
    setSession(session);

    await waitFor(() => expect(result.current).toEqual(session));
  });

  it('useIsAuthenticated follows the session', async () => {
    const { result } = await renderHook(() => useIsAuthenticated());
    expect(result.current).toBe(false);

    setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 });

    await waitFor(() => expect(result.current).toBe(true));

    setSession(null);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('useIsAdmin is true only when the access token carries the admin role', async () => {
    const { result } = await renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);

    setSession({ accessToken: tokenWithRoles(['owner']), refreshToken: 'rt', expiresAt: Date.now() + 60_000 });
    await waitFor(() => expect(result.current).toBe(false));

    setSession({ accessToken: tokenWithRoles(['owner', 'admin']), refreshToken: 'rt', expiresAt: Date.now() + 60_000 });
    await waitFor(() => expect(result.current).toBe(true));
  });
});
