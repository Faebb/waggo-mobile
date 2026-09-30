import { useQuery } from '@tanstack/react-query';

import { getRoute } from '../api/trackingApi';

/** How often the owner's screen redraws the route while the walk is live. */
export const ROUTE_REFRESH_MS = 5000;

export function useRoute(walkId: string, live: boolean) {
  return useQuery({
    queryKey: ['tracking', 'route', walkId] as const,
    queryFn: () => getRoute(walkId),
    refetchInterval: live ? ROUTE_REFRESH_MS : false,
  });
}
