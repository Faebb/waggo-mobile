import { router, Stack } from 'expo-router';

import { WelcomeScreen } from '@/features/onboarding';

// Routes stay thin: they only compose feature screens and wire navigation.
export default function Welcome() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WelcomeScreen onStart={() => router.replace('/inicio')} />
    </>
  );
}
