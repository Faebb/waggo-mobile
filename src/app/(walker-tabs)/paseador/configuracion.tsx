import { router } from 'expo-router';

import { SettingsScreen } from '@/features/profile';

export default function WalkerSettings() {
  return (
    <SettingsScreen
      onOpenPersonalInfo={() => router.push('/configuracion/info')}
      onOpenNotifications={() => router.push('/paseador/notificaciones')}
      onOpenChangePassword={() => router.push('/configuracion/contrasena')}
      onOpenChangeEmail={() => router.push('/configuracion/correo')}
      onLoggedOut={() => router.replace('/')}
    />
  );
}
