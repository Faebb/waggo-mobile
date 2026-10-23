import { router, useLocalSearchParams, type Href } from 'expo-router';

import { VerifyCodeScreen } from '@/features/auth';

export default function Verificar() {
  const { challengeId, email, redirect } = useLocalSearchParams<{
    challengeId: string;
    email?: string;
    redirect?: string;
  }>();
  return (
    <VerifyCodeScreen
      challengeId={challengeId}
      email={email}
      onVerified={() => router.replace((redirect ?? '/inicio') as Href)}
    />
  );
}
