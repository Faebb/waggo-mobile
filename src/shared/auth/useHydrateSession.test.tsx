import { renderHook, waitFor } from '@testing-library/react-native';

import { getSession, setSession, SESSION_STORAGE_KEY } from './session';
import { useHydrateSession } from './useHydrateSession';

const mockStore = new Map<string, string>();

jest.mock('./secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStore.set(key, value);
      return Promise.resolve();
    }),
    deleteItem: jest.fn((key: string) => {
      mockStore.delete(key);
      return Promise.resolve();
    }),
  },
}));

describe('useHydrateSession', () => {
  beforeEach(() => setSession(null));

  afterEach(() => mockStore.clear());

  it('restores a previously saved session on mount', async () => {
    const saved = { accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 };
    mockStore.set(SESSION_STORAGE_KEY, JSON.stringify(saved));

    await renderHook(() => useHydrateSession());

    await waitFor(() => expect(getSession()).toEqual(saved));
  });

  it('stays signed out when nothing was saved', async () => {
    await renderHook(() => useHydrateSession());

    expect(getSession()).toBeNull();
  });

  it('ignores corrupt storage instead of crashing', async () => {
    mockStore.set(SESSION_STORAGE_KEY, 'not json');

    await renderHook(() => useHydrateSession());

    expect(getSession()).toBeNull();
  });

  it('persists a new session once signed in', async () => {
    await renderHook(() => useHydrateSession());

    const session = { accessToken: 'at-2', refreshToken: 'rt-2', expiresAt: Date.now() + 60_000 };
    setSession(session);

    await waitFor(() => expect(mockStore.get(SESSION_STORAGE_KEY)).toBe(JSON.stringify(session)));
  });

  it('removes the stored session on logout', async () => {
    mockStore.set(
      SESSION_STORAGE_KEY,
      JSON.stringify({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 }),
    );
    await renderHook(() => useHydrateSession());
    await waitFor(() => expect(getSession()).not.toBeNull());

    setSession(null);

    await waitFor(() => expect(mockStore.has(SESSION_STORAGE_KEY)).toBe(false));
  });
});
