import { router, Stack, useLocalSearchParams } from 'expo-router';

import { WalkStatusScreen } from '@/features/walks';

export default function WalkDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <WalkStatusScreen walkId={id} onOpenChat={() => router.push({ pathname: '/paseos/[id]/chat', params: { id } })} />
    </>
  );
}
