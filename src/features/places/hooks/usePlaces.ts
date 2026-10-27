import { useMutation, useQuery } from '@tanstack/react-query';

import type { LatLng } from '@/shared/map/types';

import { nominatim } from '../api/nominatimApi';

/** Search on demand ("Buscar"), never while typing (Nominatim policy). */
export function usePlaceSearch() {
  return useMutation({ mutationFn: (text: string) => nominatim.search(text) });
}

/** Address of a point; nothing is asked while `point` is null. Answers are kept for the session. */
export function useReverseGeocode(point: LatLng | null) {
  return useQuery({
    queryKey: ['places', 'reverse', point?.latitude.toFixed(5), point?.longitude.toFixed(5)] as const,
    queryFn: () => (point ? nominatim.reverse(point) : Promise.resolve(null)),
    enabled: point !== null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}
