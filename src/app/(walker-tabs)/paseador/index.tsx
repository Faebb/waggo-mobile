import { router } from 'expo-router';

import { WalkerGate, WalkerHomeScreen } from '@/features/walker';

export default function WalkerHome() {
  return (
    <WalkerGate>
      <WalkerHomeScreen
        onOpenAssigned={(id) => router.push({ pathname: '/paseador/[id]', params: { id } })}
        onOpenNotifications={() => router.push('/paseador/notificaciones')}
      />
    </WalkerGate>
  );
}
