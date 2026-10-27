import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { useIsAuthenticated } from '@/shared/auth/session';
import { useHydrateSession } from '@/shared/auth/useHydrateSession';
import { fontsToLoad, typography, useColors, useThemeMode } from '@/shared/ui/theme';
import { AuthBarLogo } from '@/shared/ui/AuthHeader';
import { SplashView } from '@/shared/ui/SplashView';
import { useHydrateThemeMode } from '@/shared/ui/useHydrateThemeMode';

/** Reachable with no session: the welcome screen, the whole sign-in flow and the public fare quote (RF-019). */
const PUBLIC_SEGMENTS = new Set([
  '',
  'login',
  'registro',
  'confirmar',
  'olvide-contrasena',
  'restablecer-contrasena',
  'cotizar',
]);

const AUTH_SCREENS = ['login', 'registro', 'confirmar', 'olvide-contrasena', 'restablecer-contrasena'] as const;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts(fontsToLoad);
  useHydrateThemeMode();
  const sessionHydrated = useHydrateSession();
  const isAuthenticated = useIsAuthenticated();
  const mode = useThemeMode();
  const colors = useColors();

  const segments = useSegments();
  useEffect(() => {
    if (!sessionHydrated || isAuthenticated) return;
    if (!PUBLIC_SEGMENTS.has(segments[0] ?? '')) {
      router.replace({ pathname: '/login', params: { redirect: `/${segments.join('/')}` } });
    }
  }, [sessionHydrated, isAuthenticated, segments]);

  /** Baloo 2 / Inter (ADR-018) must be ready before the first paint, or screens briefly flash with the system font. */
  if (!fontsLoaded) return <SplashView />;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          // Design proposal 07: the bar only carries the back arrow; each screen draws its own title in the content
          // (the sign-in flow adds the corgi head on the right, `AuthHeader`). The theme selector lives in
          // Configuración (design proposal 07 · 23), not in this bar.
          headerTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: typography.subtitle.fontFamily, fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* The tab bars (ADR-019) draw their own chrome; each tab screen owns its own in-content header. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(walker-tabs)" options={{ headerShown: false }} />
        {/* Sign-in flow (design proposal 07 · 2–5): back arrow on the left, corgi head on the right of the bar. */}
        {AUTH_SCREENS.map((name) => (
          <Stack.Screen key={name} name={name} options={{ headerRight: () => <AuthBarLogo /> }} />
        ))}
      </Stack>
    </QueryClientProvider>
  );
}
