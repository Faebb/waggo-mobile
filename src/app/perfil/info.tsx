import { router, Stack } from 'expo-router';

import { PersonalInfoScreen } from '@/features/profile';

export default function PersonalInfo() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PersonalInfoScreen onEdit={() => router.push('/perfil/editar')} />
    </>
  );
}
