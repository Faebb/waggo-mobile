import { router, useLocalSearchParams, type Href } from 'expo-router';

import { LoginScreen } from '@/features/auth';

export default function Login() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  return (
    <LoginScreen
      onLoggedIn={() => router.replace((redirect ?? '/inicio') as Href)}
      onGoToRegister={() => router.push('/registro')}
    />
  );
}
