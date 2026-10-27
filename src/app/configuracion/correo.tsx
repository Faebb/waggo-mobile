import { router, Stack } from 'expo-router';

import { ChangeEmailScreen } from '@/features/profile';

export default function ChangeEmail() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChangeEmailScreen onChanged={() => router.back()} />
    </>
  );
}
