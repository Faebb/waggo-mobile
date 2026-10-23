import { router, useLocalSearchParams } from 'expo-router';

import { LoginScreen } from '@/features/auth';

export default function Login() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  return (
    <LoginScreen
      onCodeSent={(challengeId, email) =>
        router.push({ pathname: '/verificar', params: { challengeId, email, redirect } })
      }
      onGoToRegister={() => router.push('/registro')}
    />
  );
}
