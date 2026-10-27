import { router } from 'expo-router';

import { SettingsScreen } from '@/features/profile';

export default function Settings() {
  return (
    <SettingsScreen
      onOpenPersonalInfo={() => router.push('/configuracion/info')}
      onOpenPets={() => router.push('/mascotas')}
      onOpenWalks={() => router.push('/paseos')}
      onOpenNotifications={() => router.push('/notificaciones')}
      onOpenChangePassword={() => router.push('/configuracion/contrasena')}
      onLoggedOut={() => router.replace('/')}
    />
  );
}
