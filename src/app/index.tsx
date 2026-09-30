import { router, Stack } from 'expo-router';

import { WelcomeScreen } from '@/features/onboarding';

// Routes stay thin: they only compose feature screens and wire navigation.
export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WelcomeScreen onQuotePress={() => router.push('/cotizar')} onPetsPress={() => router.push('/mascotas')} />
    </>
  );
}
