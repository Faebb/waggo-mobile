import type { z } from 'zod';

import { env } from '../config/env';
import { ApiError } from './ApiError';
import { waggoApiResponseSchema, type WaggoApiResponse } from './waggoApiResponse';

type QueryParams = Record<string, string | number | boolean | undefined>;

// Resolve the global fetch lazily so it can be replaced at runtime (interceptors, test spies).
const globalFetch: typeof fetch = (input, init) => globalThis.fetch(input, init);

export function createHttpClient(baseUrl: string, fetchFn: typeof fetch = globalFetch) {
  const root = baseUrl.replace(/\/+$/, '');

  function buildUrl(path: string, params?: QueryParams) {
    const query = Object.entries(params ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    return `${root}${path.startsWith('/') ? path : `/${path}`}${query ? `?${query}` : ''}`;
  }

  return {
    /** GET an endpoint of waggo-api and unwrap its WaggoApiResponse. Throws ApiError when `success` is false. */
    async get<T>(path: string, dataSchema: z.ZodType<T>, params?: QueryParams): Promise<WaggoApiResponse<T>> {
      const response = await fetchFn(buildUrl(path, params), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const body: unknown = await response.json().catch(() => undefined);
      const envelope = waggoApiResponseSchema(dataSchema).safeParse(body);

      if (!envelope.success) {
        if (!response.ok) {
          // Not an envelope (proxy error, server down...).
          throw new ApiError(response.status, [{ code: `Http.${response.status}`, message: `HTTP ${response.status}` }]);
        }
        // 2xx with an unexpected shape: the contract changed. Fail loudly here, not deep in the UI.
        throw envelope.error;
      }

      const { success, data, pagination, errors, warnings, infos, traceId } = envelope.data;
      if (!success || data === null) {
        throw new ApiError(response.status, errors, traceId);
      }

      return { data, pagination, warnings, infos, traceId };
    },
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export const httpClient = createHttpClient(env.apiUrl);
