import { router, Stack } from 'expo-router';

import { EditProfileScreen } from '@/features/profile';

export default function EditProfile() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EditProfileScreen onSaved={() => router.back()} />
    </>
  );
}
