import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';

import { listWalkAlerts, raiseEmergency } from '../api/alertsApi';
import type { EmergencyDraft } from '../model/alerts';

/** Alerts must show up fast on the other phone: the list refreshes every 5 seconds. */
export const ALERTS_REFRESH_MS = 5000;

const alertKeys = { walk: (walkId: string) => ['tracking', 'alerts', walkId] as const };

export function useWalkAlerts(walkId: string) {
  return useQuery({
    queryKey: alertKeys.walk(walkId),
    queryFn: () => listWalkAlerts(walkId),
    refetchInterval: ALERTS_REFRESH_MS,
  });
}

/** Raises an emergency with the current position when the phone can tell it (never waits for a missing GPS). */
export function useRaiseEmergency(walkId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const position = await getCurrentLocation();
      const draft: EmergencyDraft = position ?? {};
      return raiseEmergency(walkId, draft);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertKeys.walk(walkId) }),
  });
}
