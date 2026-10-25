const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Base64 (RFC 4648 §5, url-safe) decoder with no platform API, so it behaves the same on web and native. */
function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const char of normalized) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

/**
 * Reads the `roles` claim of our own access token (ADR-011 policies, ADR-016 issuer) without a JWT library: the
 * signature is already verified by the API on every request, so the app only needs to read the payload to decide
 * what to show — never to authorize anything by itself.
 */
export function decodeRoles(accessToken: string): string[] {
  const payload = accessToken.split('.')[1];
  if (payload === undefined) {
    return [];
  }

  try {
    const claims: unknown = JSON.parse(base64UrlDecode(payload));
    const roles = (claims as { roles?: unknown }).roles;
    if (Array.isArray(roles)) {
      return roles.filter((role): role is string => typeof role === 'string');
    }
    return typeof roles === 'string' ? [roles] : [];
  } catch {
    return [];
  }
}
