import { router, Stack } from 'expo-router';

import { HomeScreen } from '@/features/home';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HomeScreen
        onRequestWalk={() => router.push('/paseos/nuevo')}
        onOpenPets={() => router.push('/mascotas')}
        onOpenWalks={() => router.push('/paseos')}
        onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })}
      />
    </>
  );
}
