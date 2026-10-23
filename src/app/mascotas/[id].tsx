import { router, Stack, useLocalSearchParams } from 'expo-router';

import { PetDetailScreen } from '@/features/pets';

export default function PetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <PetDetailScreen petId={id} onBack={() => router.back()} />
    </>
  );
}
