import { router } from 'expo-router';

import { MyPetsScreen } from '@/features/pets';

export default function MyPets() {
  return (
    <MyPetsScreen
      onAddPress={() => router.push('/mascotas/nueva')}
      onOpenPet={(id) => router.push({ pathname: '/mascotas/[id]', params: { id } })}
    />
  );
}
