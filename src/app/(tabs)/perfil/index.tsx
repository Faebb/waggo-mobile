import { router } from 'expo-router';

import { ProfileMenuScreen } from '@/features/profile';

export default function ProfileMenu() {
  return (
    <ProfileMenuScreen
      onOpenPersonalInfo={() => router.push('/perfil/info')}
      onOpenPets={() => router.push('/mascotas')}
      onOpenWalks={() => router.push('/paseos')}
      onOpenNotifications={() => router.push('/notificaciones')}
      onLoggedOut={() => router.replace('/')}
    />
  );
}
