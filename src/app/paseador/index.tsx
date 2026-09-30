import { router, Stack } from 'expo-router';

import { WalkerGate, WalkerHomeScreen } from '@/features/walker';

export default function WalkerHome() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WalkerGate>
        <WalkerHomeScreen
          onOpenAssigned={(id) => router.push({ pathname: '/paseador/[id]', params: { id } })}
          onOpenNotifications={() => router.push('/paseador/notificaciones')}
        />
      </WalkerGate>
    </>
  );
}
