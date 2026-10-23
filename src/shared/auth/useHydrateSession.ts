import { useEffect, useState } from 'react';

import { secureStorage } from './secureStorage';
import { SESSION_STORAGE_KEY, setSession, useSession, type Session } from './session';

function isSession(value: unknown): value is Session {
  const candidate = value as Partial<Session> | null;
  return (
    candidate !== null &&
    typeof candidate === 'object' &&
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.expiresAt === 'number'
  );
}

/**
 * Loads the session from the secure keychain/keystore on first mount and persists it afterwards. Mounted once at
 * the app root (`src/app/_layout.tsx`); tokens never touch `AsyncStorage`.
 */
export function useHydrateSession() {
  const session = useSession();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    secureStorage.getItem(SESSION_STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored !== null) {
        try {
          const parsed: unknown = JSON.parse(stored);
          if (isSession(parsed)) setSession(parsed);
        } catch {
          // Corrupt storage: ignore it and start signed out.
        }
      }
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (session === null) {
      secureStorage.deleteItem(SESSION_STORAGE_KEY);
    } else {
      secureStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  }, [hydrated, session]);

  return hydrated;
}
