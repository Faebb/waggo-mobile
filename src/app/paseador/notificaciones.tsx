import { router } from 'expo-router';

import { NotificationsScreen } from '@/features/notifications';

export default function WalkerNotifications() {
  return <NotificationsScreen onOpenWalk={(id) => router.push({ pathname: '/paseador/[id]', params: { id } })} />;
}
