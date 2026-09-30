import { router, Stack } from 'expo-router';

import { WalkerHomeScreen } from '@/features/walker';

export default function WalkerHome() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WalkerHomeScreen onOpenAssigned={(id) => router.push({ pathname: '/paseador/[id]', params: { id } })} />
    </>
  );
}
