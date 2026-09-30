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

  /** Sends the request and unwraps its WaggoApiResponse. Throws ApiError when `success` is false. */
  async function send<T>(url: string, init: RequestInit, dataSchema: z.ZodType<T>): Promise<WaggoApiResponse<T>> {
    const response = await fetchFn(url, init);

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
  }

  return {
    /** GET an endpoint of waggo-api. */
    get<T>(path: string, dataSchema: z.ZodType<T>, params?: QueryParams): Promise<WaggoApiResponse<T>> {
      return send(buildUrl(path, params), { method: 'GET', headers: { Accept: 'application/json' } }, dataSchema);
    },

    /** POST a JSON body to an endpoint of waggo-api. */
    post<T>(path: string, body: unknown, dataSchema: z.ZodType<T>): Promise<WaggoApiResponse<T>> {
      return send(
        buildUrl(path),
        {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        dataSchema,
      );
    },
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export const httpClient = createHttpClient(env.apiUrl);
