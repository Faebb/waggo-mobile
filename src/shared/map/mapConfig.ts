import { env } from '@/shared/config/env';

import type { LatLng } from './types';

/**
 * Public OpenStreetMap tiles (PO decision, ADR draft "mapas OpenStreetMap"). They are fine for development and a
 * small pilot, NOT for high traffic: https://operations.osmfoundation.org/policies/tiles/. Before launch, point
 * `EXPO_PUBLIC_MAP_TILE_URL` to a tile provider or a self-hosted server.
 */
export const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Required by the OSM licence (ODbL) and tile policy: always visible, never hidden by the UI. */
export const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/**
 * Identifies the app to OSM (tiles) and Nominatim (search): base URL of the map page (its Referer) and the
 * User-Agent suffix on iOS/Android.
 */
export const APP_BASE_URL = 'https://waggo.app';
export const APP_USER_AGENT = 'Waggo/1.0 (+https://waggo.app)';

/** Leaflet pinned to 1.9.4 from cdnjs, with subresource integrity (same hashes as leafletjs.com publishes). */
export const LEAFLET = {
  js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
  jsIntegrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
  css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
  cssIntegrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
} as const;

/** First view before knowing where the user is: Colombia (PO decision). */
export const DEFAULT_CENTER: LatLng = { latitude: 9.411, longitude: -73.597 };
export const COUNTRY_ZOOM = 7;
/** Zoom when a place is fixed (pickup, my location, a search result). */
export const PLACE_ZOOM = 15;
/** Below this zoom the centered pin is too vague to be a pickup. */
export const MIN_PICK_ZOOM = 14;

/** A tile template must be https and have the three placeholders; anything else falls back to OSM. */
export function resolveTileUrl(raw: string | undefined): string {
  const value = raw?.trim() ?? '';
  const valid = /^https:\/\/[^\s"'<>]+$/.test(value) && ['{z}', '{x}', '{y}'].every((part) => value.includes(part));
  return valid ? value : DEFAULT_TILE_URL;
}

export const tileUrl = resolveTileUrl(env.mapTileUrl);
