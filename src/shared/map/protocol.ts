import { z } from 'zod';

import { MARKER_KINDS, type Geofence, type LatLng, type MapMarker, type MapPalette, type MapRoute } from './types';

/**
 * Typed messages between the app and the map page (Leaflet inside a WebView on iOS/Android, an iframe on web).
 * Both directions are validated: the app never sends a malformed command and ignores anything that is not a known
 * event (the page is the only sender, but the iframe channel is shared with the browser window).
 */
const latLngSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}) satisfies z.ZodType<LatLng>;

const zoomSchema = z.number().min(0).max(19);

const markerSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(MARKER_KINDS),
  position: latLngSchema,
  label: z.string(),
  text: z.string().max(24).optional(),
  selected: z.boolean().optional(),
  stale: z.boolean().optional(),
  accuracyMeters: z.number().nonnegative().optional(),
}) satisfies z.ZodType<MapMarker>;

const routeSchema = z.object({
  walked: z.array(latLngSchema),
  pending: z.array(latLngSchema),
}) satisfies z.ZodType<MapRoute>;

const geofenceSchema = z.object({
  center: latLngSchema,
  radiusMeters: z.number().positive(),
  alert: z.boolean(),
}) satisfies z.ZodType<Geofence>;

const paletteSchema = z.object({
  primary: z.string(),
  primaryText: z.string(),
  secondary: z.string(),
  danger: z.string(),
  dangerText: z.string(),
  muted: z.string(),
  surface: z.string(),
  text: z.string(),
  land: z.string(),
  routeCasing: z.string(),
  tileFilter: z.string(),
}) satisfies z.ZodType<MapPalette>;

export const mapCommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('setView'), center: latLngSchema, zoom: zoomSchema }),
  z.object({ type: z.literal('fitBounds'), points: z.array(latLngSchema).min(1) }),
  z.object({ type: z.literal('setMarkers'), markers: z.array(markerSchema) }),
  z.object({ type: z.literal('setRoute'), route: routeSchema.nullable() }),
  z.object({ type: z.literal('setGeofence'), geofence: geofenceSchema.nullable() }),
  z.object({ type: z.literal('setTheme'), palette: paletteSchema }),
]);
export type MapCommand = z.infer<typeof mapCommandSchema>;

export const mapEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('moveStart') }),
  z.object({ type: z.literal('moveEnd'), center: latLngSchema, zoom: zoomSchema, byUser: z.boolean() }),
  z.object({ type: z.literal('markerTap'), id: z.string() }),
  z.object({ type: z.literal('tileError') }),
  z.object({ type: z.literal('error'), message: z.string() }),
]);
export type MapEvent = z.infer<typeof mapEventSchema>;

/** The JSON string sent to the page. Throws on an invalid command: that is a bug in the caller. */
export function encodeCommand(command: MapCommand): string {
  return JSON.stringify(mapCommandSchema.parse(command));
}

/** A known event from the page, or null for anything else. */
export function parseMapEvent(raw: unknown): MapEvent | null {
  if (typeof raw !== 'string') return null;
  try {
    const result = mapEventSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
