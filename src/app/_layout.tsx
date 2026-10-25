import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useIsAuthenticated } from '@/shared/auth/session';
import { useHydrateSession } from '@/shared/auth/useHydrateSession';
import { fontsToLoad, typography, useColors, useThemeMode } from '@/shared/ui/theme';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useHydrateThemeMode } from '@/shared/ui/useHydrateThemeMode';

/** Reachable with no session: the welcome screen, the whole sign-in flow and the public fare quote (RF-019). */
const PUBLIC_SEGMENTS = new Set(['', 'login', 'registro', 'confirmar', 'verificar', 'cotizar']);

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
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTitle: 'Waggo',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: typography.subtitle.fontFamily, fontWeight: '700' },
          headerShadowVisible: false,
          headerRight: () => <ThemeToggle />,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </QueryClientProvider>
  );
}
