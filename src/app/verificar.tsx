import { router, useLocalSearchParams, type Href } from 'expo-router';

import { VerifyCodeScreen } from '@/features/auth';

export default function Verificar() {
  const { challengeId, redirect } = useLocalSearchParams<{ challengeId: string; redirect?: string }>();
  return (
    <VerifyCodeScreen challengeId={challengeId} onVerified={() => router.replace((redirect ?? '/inicio') as Href)} />
  );
}
