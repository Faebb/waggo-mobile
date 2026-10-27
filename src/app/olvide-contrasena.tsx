import { router, useLocalSearchParams } from 'expo-router';

import { ForgotPasswordScreen } from '@/features/auth';

export default function OlvideContrasena() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return (
    <ForgotPasswordScreen
      initialEmail={email ?? ''}
      onCodeSent={(sentTo) => router.replace({ pathname: '/restablecer-contrasena', params: { email: sentTo } })}
    />
  );
}
