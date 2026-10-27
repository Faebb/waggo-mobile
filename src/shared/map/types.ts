/** A point on the map, in degrees (WGS 84), the same shape the API and `expo-location` use. */
export type LatLng = { latitude: number; longitude: number };

/**
 * What a marker stands for (design proposal 04 · 2): the owner's own position (dot with accuracy halo), the walker
 * (avatar), the dog (avatar with its initial, stuck to the walker during the walk), the pickup (the owner's home,
 * drop with a house), a different destination (drop with a flag), an alert (rhombus with "!") and an open request
 * on the walker's map (pill with what it pays).
 */
export const MARKER_KINDS = ['owner', 'walker', 'dog', 'pickup', 'destination', 'alert', 'offer'] as const;
export type MarkerKind = (typeof MARKER_KINDS)[number];

export type MapMarker = {
  id: string;
  kind: MarkerKind;
  position: LatLng;
  /** Spoken and shown in the list alternative, e.g. "Recogida: Cra 7 # 45-10". */
  label: string;
  /** Short text drawn inside the marker: the dog's initial or the price of a request. */
  text?: string;
  /** A selected request pill is filled with `primary`. */
  selected?: boolean;
  /** The position is old (no signal): the marker turns grey. */
  stale?: boolean;
  /** GPS uncertainty in meters: draws the accuracy halo. */
  accuracyMeters?: number;
};

/** Walked stretch (solid line) and pending stretch (dashed, e.g. the walker on the way to the pickup). */
export type MapRoute = { walked: LatLng[]; pending: LatLng[] };

/** The agreed zone (RF-009): a circle around the pickup, red when the walk left it. */
export type Geofence = { center: LatLng; radiusMeters: number; alert: boolean };

export type MapTheme = 'light' | 'dark';

/** Colors the map page needs, resolved from the app palette for the current theme (see `mapPaletteOf`). */
export type MapPalette = {
  primary: string;
  primaryText: string;
  secondary: string;
  danger: string;
  dangerText: string;
  muted: string;
  surface: string;
  text: string;
  land: string;
  routeCasing: string;
  /** CSS `filter` applied to the tile layer only: OSM tiles are light, the dark theme inverts them. */
  tileFilter: string;
};
