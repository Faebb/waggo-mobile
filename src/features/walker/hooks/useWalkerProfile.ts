import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMyWalkerProfile, registerWalker } from '../api/walkerProfileApi';
import type { WalkerDraft } from '../model/types';

export const walkerProfileKeys = { mine: ['walker', 'profile'] as const };

/** While the profile is pending, it is checked every 30 seconds so the walker gets in as soon as it is approved. */
export const PENDING_REFRESH_MS = 30_000;

export function useMyWalkerProfile() {
  return useQuery({
    queryKey: walkerProfileKeys.mine,
    queryFn: () => getMyWalkerProfile(),
    refetchInterval: (query) => (query.state.data?.status === 'Pending' ? PENDING_REFRESH_MS : false),
  });
}

/** Registers the walker; the gate shows the new (pending) profile right away. */
export function useRegisterWalker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: WalkerDraft) => registerWalker(draft),
    onSuccess: (profile) => queryClient.setQueryData(walkerProfileKeys.mine, profile),
  });
}
