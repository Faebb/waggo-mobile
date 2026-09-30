import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { walkKeys } from '@/features/walks';
import type { Coordinates } from '@/shared/location/getCurrentLocation';

import { acceptWalk, listAssignedWalks, listAvailableWalks } from '../api/walkerApi';

export const walkerKeys = {
  available: (near: Coordinates | null) => ['walker', 'available', near?.latitude, near?.longitude] as const,
  assigned: ['walker', 'assigned'] as const,
};

/** New requests keep arriving, like ride requests for a driver: the list refreshes every 10 seconds. */
export const AVAILABLE_REFRESH_MS = 10_000;

export function useAvailableWalks(near: Coordinates | null) {
  return useQuery({
    queryKey: walkerKeys.available(near),
    queryFn: () => listAvailableWalks(near),
    refetchInterval: AVAILABLE_REFRESH_MS,
  });
}

export function useAssignedWalks() {
  return useQuery({ queryKey: walkerKeys.assigned, queryFn: () => listAssignedWalks() });
}

/** Accepts a request. Win or lose, the open requests are reloaded (someone may have taken it). */
export function useAcceptWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptWalk(id),
    onSuccess: (walk) => {
      queryClient.setQueryData(walkKeys.one(walk.id), walk);
      return queryClient.invalidateQueries({ queryKey: walkerKeys.assigned });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['walker', 'available'] }),
  });
}
