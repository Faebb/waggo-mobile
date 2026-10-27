import { router, Stack, useLocalSearchParams } from 'expo-router';

import { RequestWalkScreen } from '@/features/walks';

export default function NewWalk() {
  // From a dog's detail ("Pedir paseo con Luna") the dog comes preselected.
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <RequestWalkScreen
        initialPetIds={petId ? [petId] : []}
        // Replace, so going back from the walk returns home instead of to the finished form.
        onRequested={(walk) => router.replace({ pathname: '/paseos/[id]', params: { id: walk.id } })}
        onAddPet={() => router.push('/mascotas/nueva')}
      />
    </>
  );
}
