import { router, useLocalSearchParams } from 'expo-router';

import { ResetPasswordScreen } from '@/features/auth';

export default function RestablecerContrasena() {
  const { email } = useLocalSearchParams<{ email: string }>();
  return <ResetPasswordScreen email={email} onReset={() => router.replace('/login')} />;
}
