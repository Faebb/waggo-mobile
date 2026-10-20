import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cancelWalk, getWalk, listMyWalks, requestWalk } from '../api/walksApi';
import { ACTIVE_STATUSES, type Walk, type WalkDraft } from '../model/types';

export const walkKeys = {
  mine: ['walks', 'mine'] as const,
  one: (id: string) => ['walks', id] as const,
};

/** How often the walk screen asks for news while the walk is going on. */
export const WALK_POLL_INTERVAL_MS = 5000;

export function useMyWalks() {
  return useQuery({ queryKey: walkKeys.mine, queryFn: () => listMyWalks() });
}

/** One walk. While it is going on it refreshes by itself, so the owner sees when a walker accepts. */
export function useWalk(id: string, pollIntervalMs: number = WALK_POLL_INTERVAL_MS) {
  return useQuery({
    queryKey: walkKeys.one(id),
    queryFn: () => getWalk(id),
    refetchInterval: (query) =>
      query.state.data && ACTIVE_STATUSES.includes(query.state.data.status) ? pollIntervalMs : false,
  });
}

export function useRequestWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: WalkDraft) => requestWalk(draft),
    onSuccess: (walk) => {
      queryClient.setQueryData(walkKeys.one(walk.id), walk);
      return queryClient.invalidateQueries({ queryKey: walkKeys.mine });
    },
  });
}

export function useCancelWalk(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelWalk(id),
    onSuccess: (walk: Walk) => {
      queryClient.setQueryData(walkKeys.one(id), walk);
      return queryClient.invalidateQueries({ queryKey: walkKeys.mine });
    },
  });
}
