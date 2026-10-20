import { router, Stack } from 'expo-router';

import { AddPetScreen } from '@/features/pets';

export default function NewPet() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <AddPetScreen onSaved={() => router.back()} />
    </>
  );
}
