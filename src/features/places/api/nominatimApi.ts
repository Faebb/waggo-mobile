import { Platform } from 'react-native';
import { z } from 'zod';

import { APP_USER_AGENT } from '@/shared/map/mapConfig';
import type { LatLng } from '@/shared/map/types';

import { placeFromNominatim } from '../model/formatPlace';
import type { NominatimPlace, Place } from '../model/types';

/**
 * OpenStreetMap search (Nominatim), PO decision. Its usage policy
 * (https://operations.osmfoundation.org/policies/nominatim/) asks for: at most 1 request per second, no
 * autocomplete while typing (the app searches only on "Buscar"), an identifying User-Agent or Referer, and caching.
 * No API key. Not for high traffic: like the tiles, it must move to a provider or self-hosting before launch.
 */
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const MIN_INTERVAL_MS = 1000;
const MIN_QUERY_LENGTH = 3;

const placeSchema = z.object({
  place_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  name: z.string().nullish(),
  address: z.record(z.string(), z.string()).optional(),
}) satisfies z.ZodType<NominatimPlace>;

const reverseSchema = z.union([placeSchema, z.object({ error: z.string() })]);

type Deps = {
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Browsers do not let a page set the User-Agent; there the Referer identifies the app. */
  sendUserAgent?: boolean;
};

const query = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

export function createNominatimClient({
  fetchFn = (url, init) => fetch(url, init),
  now = Date.now,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  sendUserAgent = Platform.OS !== 'web',
}: Deps = {}) {
  let lastRequestAt = Number.NEGATIVE_INFINITY;
  let queue: Promise<unknown> = Promise.resolve();
  const cache = new Map<string, Promise<unknown>>();

  /** Requests go one after another, at least one second apart. */
  function throttled<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(async () => {
      const wait = lastRequestAt + MIN_INTERVAL_MS - now();
      if (wait > 0) await sleep(wait);
      lastRequestAt = now();
      return task();
    });
    queue = run.catch(() => undefined);
    return run;
  }

  function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = cache.get(key);
    if (hit) return hit as Promise<T>;
    const result = throttled(load);
    cache.set(key, result);
    result.catch(() => cache.delete(key));
    return result;
  }

  async function get(path: string, params: Record<string, string>): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (sendUserAgent) headers['User-Agent'] = APP_USER_AGENT;
    const url = `${NOMINATIM_URL}/${path}?${query({ ...params, format: 'jsonv2', addressdetails: '1', 'accept-language': 'es' })}`;
    const response = await fetchFn(url, { headers });
    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    return response.json();
  }

  return {
    /** Up to 5 places in Colombia for what the user typed. */
    search(text: string): Promise<Place[]> {
      const q = text.trim().replace(/\s+/g, ' ');
      if (q.length < MIN_QUERY_LENGTH) return Promise.resolve([]);
      return cached(`search:${q.toLowerCase()}`, async () => {
        const data = z.array(placeSchema).parse(await get('search', { q, countrycodes: 'co', limit: '5' }));
        return data.map(placeFromNominatim);
      });
    },

    /** The address of a point (pin dropped, my location), or null when OSM has none there. */
    reverse(point: LatLng): Promise<Place | null> {
      const lat = point.latitude.toFixed(5);
      const lon = point.longitude.toFixed(5);
      return cached(`reverse:${lat},${lon}`, async () => {
        const data = reverseSchema.parse(await get('reverse', { lat, lon, zoom: '18' }));
        return 'error' in data ? null : placeFromNominatim(data);
      });
    },
  };
}

/** One client for the whole app, so the rate limit and the cache are shared. */
export const nominatim = createNominatimClient();
