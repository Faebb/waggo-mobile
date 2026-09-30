import { router, Stack, useLocalSearchParams } from 'expo-router';

import { AssignedWalkScreen } from '@/features/walker';

export default function AssignedWalk() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <AssignedWalkScreen
        walkId={id}
        onOpenChat={() => router.push({ pathname: '/paseador/[id]/chat', params: { id } })}
      />
    </>
  );
}
