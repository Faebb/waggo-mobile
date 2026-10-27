import { router, Stack } from 'expo-router';

import { ChangePasswordScreen } from '@/features/profile';

export default function ChangePassword() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChangePasswordScreen onChanged={() => router.back()} />
    </>
  );
}
