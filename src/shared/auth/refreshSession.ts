import { z } from 'zod';

import { getSession, setSession } from './session';

const refreshEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresInSeconds: z.number(),
    })
    .nullable(),
});

/**
 * Rotates the refresh token (RNF-002) on a 401. A raw fetch, not `httpClient.send`: that would recurse back into
 * this same 401-handling path. On any failure the session is cleared, so the app falls back to signed-out.
 */
export function tryRefreshSession(baseUrl: string, fetchFn: typeof fetch): Promise<boolean> {
  // Concurrent 401s must share one call: the backend treats a second use of the same refresh token as reuse
  // and revokes the whole session.
  inFlightRefresh ??= refreshOnce(baseUrl, fetchFn).finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

let inFlightRefresh: Promise<boolean> | null = null;

async function refreshOnce(baseUrl: string, fetchFn: typeof fetch): Promise<boolean> {
  const current = getSession();
  if (current === null) return false;

  try {
    const response = await fetchFn(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    const body: unknown = await response.json().catch(() => undefined);
    const parsed = refreshEnvelopeSchema.safeParse(body);

    if (!parsed.success || !parsed.data.success || parsed.data.data === null) {
      setSession(null);
      return false;
    }

    setSession({
      accessToken: parsed.data.data.accessToken,
      refreshToken: parsed.data.data.refreshToken,
      expiresAt: Date.now() + parsed.data.data.expiresInSeconds * 1000,
    });
    return true;
  } catch {
    setSession(null);
    return false;
  }
}
