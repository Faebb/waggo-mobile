import { useEffect, useState } from 'react';

import { decodeRoles } from './roles';

/** RNF-002: the API's own short access token plus a rotating refresh token (ADR-016). */
export type Session = { accessToken: string; refreshToken: string; expiresAt: number };

// expo-secure-store only allows alphanumeric, ".", "-" and "_" in keys (no ":").
export const SESSION_STORAGE_KEY = 'waggo.session';

let session: Session | null = null;
const listeners = new Set<() => void>();

export function getSession(): Session | null {
  return session;
}

export function setSession(next: Session | null) {
  session = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession(): Session | null {
  const [current, setCurrent] = useState(getSession);

  useEffect(() => subscribe(() => setCurrent(getSession())), []);

  return current;
}

export function useIsAuthenticated(): boolean {
  return useSession() !== null;
}

/** Only for showing or hiding admin-only UI (e.g. the admin panel link) — the API still enforces the role. */
export function useIsAdmin(): boolean {
  const session = useSession();
  return session !== null && decodeRoles(session.accessToken).includes('admin');
}
