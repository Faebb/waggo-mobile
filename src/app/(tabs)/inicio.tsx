import { router } from 'expo-router';

import { HomeScreen } from '@/features/home';
import { useIsAdmin } from '@/shared/auth/session';

export default function Home() {
  const isAdmin = useIsAdmin();

  return (
    <HomeScreen
      onRequestWalk={() => router.push('/paseos/nuevo')}
      onAddPet={() => router.push('/mascotas/nueva')}
      onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })}
      onOpenNotifications={() => router.push('/notificaciones')}
      onOpenAdmin={isAdmin ? () => router.push('/admin') : undefined}
    />
  );
}
