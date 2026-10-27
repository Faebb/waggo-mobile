import { router } from 'expo-router';

import { WalkerGate, WalkerWalksScreen } from '@/features/walker';

export default function WalkerWalks() {
  return (
    <WalkerGate>
      <WalkerWalksScreen onOpenWalk={(id) => router.push({ pathname: '/paseador/[id]', params: { id } })} />
    </WalkerGate>
  );
}
