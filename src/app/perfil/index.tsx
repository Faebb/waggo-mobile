import { router, Stack } from 'expo-router';

import { ProfileMenuScreen } from '@/features/profile';

export default function ProfileMenu() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileMenuScreen
        onOpenPersonalInfo={() => router.push('/perfil/info')}
        onOpenPets={() => router.push('/mascotas')}
        onOpenWalks={() => router.push('/paseos')}
        onOpenNotifications={() => router.push('/notificaciones')}
        onLoggedOut={() => router.replace('/')}
      />
    </>
  );
}
