import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { setDevRole } from '@/shared/api/devIdentity';
import { typography, useColors, useThemeMode } from '@/shared/ui/theme';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useHydrateThemeMode } from '@/shared/ui/useHydrateThemeMode';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  useHydrateThemeMode();
  const mode = useThemeMode();
  const colors = useColors();

  // Development identity until the login exists (ADR-011): the walker side (/paseador) goes as the development
  // walker, everything else as the development owner. Set during render so the first request already has it.
  const segments = useSegments();
  setDevRole(segments[0] === 'paseador' ? 'walker' : 'owner');

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
