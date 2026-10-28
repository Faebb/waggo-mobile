/**
 * Runtime configuration. Only variables prefixed with EXPO_PUBLIC_ are inlined into the bundle.
 * Android emulator → http://10.0.2.2:8080 · iOS simulator / web → http://localhost:8080
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
  /** Map tile template `https://…/{z}/{x}/{y}.png`; empty → public OpenStreetMap tiles (see shared/map/mapConfig). */
  mapTileUrl: process.env.EXPO_PUBLIC_MAP_TILE_URL,
  /** OAuth web client id of Google sign-in (ADR-017). Public value; empty → no Google button on the web. */
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
} as const;
