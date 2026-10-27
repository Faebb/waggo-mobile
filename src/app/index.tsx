import { router, Stack } from 'expo-router';

import { WelcomeScreen } from '@/features/onboarding';
import { useIsAuthenticated } from '@/shared/auth/session';

function goTo(destination: '/inicio' | '/paseador', isAuthenticated: boolean) {
  if (isAuthenticated) {
    router.replace(destination);
  } else {
    router.push({ pathname: '/login', params: { redirect: destination } });
  }
}

// Routes stay thin: they only compose feature screens and wire navigation.
export default function Welcome() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WelcomeScreen
        onStartAsOwner={() => goTo('/inicio', isAuthenticated)}
        onStartAsWalker={() => goTo('/paseador', isAuthenticated)}
        onLogin={() => router.push('/login')}
      />
    </>
  );
}
