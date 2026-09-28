import type { z } from 'zod';

import { env } from '../config/env';
import { ApiError } from './ApiError';

type QueryParams = Record<string, string | number | boolean | undefined>;

type ProblemDetails = { title?: string; detail?: string; code?: string };

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
    async get<T>(path: string, schema: z.ZodType<T>, params?: QueryParams): Promise<T> {
      const response = await fetchFn(buildUrl(path, params), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const body: unknown = await response.json().catch(() => undefined);

      if (!response.ok) {
        const problem = (body ?? {}) as ProblemDetails;
        throw new ApiError(response.status, problem.detail ?? problem.title ?? `HTTP ${response.status}`, problem.code);
      }

      // Validate the contract: if the backend changes shape we fail loudly here, not deep in the UI.
      return schema.parse(body);
    },
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export const httpClient = createHttpClient(env.apiUrl);
