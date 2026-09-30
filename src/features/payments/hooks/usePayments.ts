import { useQuery } from '@tanstack/react-query';

import type { WalkStatus } from '@/features/walks';

import { getMyEarnings, getWalkPayment } from '../api/paymentsApi';

export const paymentKeys = {
  // The walk status is part of the key: when the walk ends or is cancelled, the payment is read again.
  walk: (walkId: string, walkStatus: WalkStatus) => ['payments', 'walk', walkId, walkStatus] as const,
  earnings: ['payments', 'earnings'] as const,
};

export function useWalkPayment(walkId: string, walkStatus: WalkStatus) {
  return useQuery({ queryKey: paymentKeys.walk(walkId, walkStatus), queryFn: () => getWalkPayment(walkId) });
}

export function useMyEarnings() {
  return useQuery({ queryKey: paymentKeys.earnings, queryFn: () => getMyEarnings() });
}
