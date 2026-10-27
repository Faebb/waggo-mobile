import { Redirect, router } from 'expo-router';

import { AdminScreen } from '@/features/admin';
import { useIsAdmin } from '@/shared/auth/session';

export default function AdminHome() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Redirect href="/inicio" />;
  }

  // "Ver paseo" (Operación, slices 2–3) has no admin walk view yet; it reuses the walk detail until the spec says so.
  return <AdminScreen onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })} />;
}
