import { router } from 'expo-router';

import { NotificationsScreen } from '@/features/notifications';

export default function OwnerNotifications() {
  return <NotificationsScreen onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })} />;
}
