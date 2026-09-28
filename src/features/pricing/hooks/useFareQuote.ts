import { useQuery } from '@tanstack/react-query';

import { getFareQuote, type FareQuoteRequest } from '../api/pricingApi';

export const fareQuoteKeys = {
  quote: (request: FareQuoteRequest) => ['pricing', 'quote', request.walkType, request.durationMinutes] as const,
};

export function useFareQuote(request: FareQuoteRequest) {
  return useQuery({
    queryKey: fareQuoteKeys.quote(request),
    queryFn: () => getFareQuote(request),
    staleTime: 5 * 60 * 1000, // rates rarely change
  });
}
