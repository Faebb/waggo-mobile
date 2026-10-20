import { router, Stack } from 'expo-router';

import { MyPetsScreen } from '@/features/pets';

export default function MyPets() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <MyPetsScreen onAddPress={() => router.push('/mascotas/nueva')} />
    </>
  );
}
