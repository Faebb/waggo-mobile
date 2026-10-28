import { router } from 'expo-router';

import { RegisterScreen } from '@/features/auth';

export default function Registro() {
  return (
    <RegisterScreen
      onRegistered={(email) => router.replace({ pathname: '/confirmar', params: { email } })}
      onLoggedIn={() => router.replace('/inicio')}
    />
  );
}
