import { router } from 'expo-router';

import { MyWalksScreen } from '@/features/walks';

export default function MyWalks() {
  return (
    <MyWalksScreen
      onOpenWalk={(id) => router.push({ pathname: '/paseos/[id]', params: { id } })}
      onRequestWalk={() => router.push('/paseos/nuevo')}
    />
  );
}
