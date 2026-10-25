import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { WalkerProfile } from '@/features/walker';

import { approveWalker, listPendingWalkers, rejectWalker } from '../api/adminWalkersApi';

export const adminWalkersKeys = { pending: ['admin', 'walkers', 'pending'] as const };

export function usePendingWalkers() {
  return useQuery({ queryKey: adminWalkersKeys.pending, queryFn: () => listPendingWalkers() });
}

function removeFromPendingQueue(queryClient: ReturnType<typeof useQueryClient>, profile: WalkerProfile) {
  queryClient.setQueryData<WalkerProfile[]>(adminWalkersKeys.pending, (current) =>
    current?.filter((pending) => pending.id !== profile.id),
  );
}

export function useApproveWalker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveWalker(id),
    onSuccess: (profile) => removeFromPendingQueue(queryClient, profile),
  });
}

export function useRejectWalker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectWalker(id, reason),
    onSuccess: (profile) => removeFromPendingQueue(queryClient, profile),
  });
}
