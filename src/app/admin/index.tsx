import { Redirect, Stack } from 'expo-router';

import { AdminWalkersScreen } from '@/features/admin';
import { useIsAdmin } from '@/shared/auth/session';

export default function AdminHome() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Redirect href="/inicio" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminWalkersScreen />
    </>
  );
}
