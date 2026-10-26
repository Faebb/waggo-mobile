import { router } from 'expo-router';

import { MyPetsScreen } from '@/features/pets';

export default function MyPets() {
  return <MyPetsScreen onAddPress={() => router.push('/mascotas/nueva')} />;
}
