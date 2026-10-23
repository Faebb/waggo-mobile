import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useIsAuthenticated } from '@/shared/auth/session';
import { useHydrateSession } from '@/shared/auth/useHydrateSession';
import { typography, useColors } from '@/shared/ui/theme';

/** Reachable with no session: the welcome screen, the whole sign-in flow and the public fare quote (RF-019). */
const PUBLIC_SEGMENTS = new Set(['', 'login', 'registro', 'confirmar', 'verificar', 'cotizar']);

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const sessionHydrated = useHydrateSession();
  const isAuthenticated = useIsAuthenticated();
  const colors = useColors();

  const segments = useSegments();
  useEffect(() => {
    if (!sessionHydrated || isAuthenticated) return;
    if (!PUBLIC_SEGMENTS.has(segments[0] ?? '')) {
      router.replace({ pathname: '/login', params: { redirect: `/${segments.join('/')}` } });
    }
  }, [sessionHydrated, isAuthenticated, segments]);

  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerTitle: 'Waggo',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: typography.subtitle.fontFamily, fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
