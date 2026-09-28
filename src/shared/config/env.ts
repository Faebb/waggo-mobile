/**
 * Runtime configuration. Only variables prefixed with EXPO_PUBLIC_ are inlined into the bundle.
 * Android emulator → http://10.0.2.2:8080 · iOS simulator / web → http://localhost:8080
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
} as const;
