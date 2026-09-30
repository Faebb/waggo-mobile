import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { setDevRole } from '@/shared/api/devIdentity';
import { colors, typography } from '@/shared/ui/theme';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  // Development identity until the login exists (ADR-011): the walker side (/paseador) goes as the development
  // walker, everything else as the development owner. Set during render so the first request already has it.
  const segments = useSegments();
  setDevRole(segments[0] === 'paseador' ? 'walker' : 'owner');

  return (
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
  );
}
