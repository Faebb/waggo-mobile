import { router, useLocalSearchParams } from 'expo-router';

import { ConfirmScreen } from '@/features/auth';

export default function Confirmar() {
  const { email } = useLocalSearchParams<{ email: string }>();
  return <ConfirmScreen email={email} onConfirmed={() => router.replace('/login')} />;
}
