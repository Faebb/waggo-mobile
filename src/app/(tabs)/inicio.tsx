import { router } from 'expo-router';

import { HomeScreen } from '@/features/home';
import { useIsAdmin } from '@/shared/auth/session';

export default function Home() {
  const isAdmin = useIsAdmin();

  return (
    <HomeScreen
      onRequestWalk={() => router.push('/paseos/nuevo')}
      onOpenPets={() => router.push('/mascotas')}
      onOpenWalks={() => router.push('/paseos')}
      onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })}
      onOpenNotifications={() => router.push('/notificaciones')}
      onOpenProfile={() => router.push('/configuracion')}
      onOpenAdmin={isAdmin ? () => router.push('/admin') : undefined}
    />
  );
}
