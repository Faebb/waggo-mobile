import { router, useLocalSearchParams } from 'expo-router';

import { LoginScreen } from '@/features/auth';

export default function Login() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  return (
    <LoginScreen
      onCodeSent={(challengeId) => router.push({ pathname: '/verificar', params: { challengeId, redirect } })}
      onGoToRegister={() => router.push('/registro')}
    />
  );
}
