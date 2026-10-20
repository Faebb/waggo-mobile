import { router, Stack } from 'expo-router';

import { MyWalksScreen } from '@/features/walks';

export default function MyWalks() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <MyWalksScreen onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })} />
    </>
  );
}
