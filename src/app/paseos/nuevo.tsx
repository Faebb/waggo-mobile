import { router, Stack } from 'expo-router';

import { RequestWalkScreen } from '@/features/walks';

export default function NewWalk() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <RequestWalkScreen
        // Replace, so going back from the walk returns home instead of to the finished form.
        onRequested={(walk) => router.replace({ pathname: '/paseos/[id]', params: { id: walk.id } })}
        onAddPet={() => router.push('/mascotas/nueva')}
      />
    </>
  );
}
