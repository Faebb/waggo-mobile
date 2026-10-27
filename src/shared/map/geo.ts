import type { LatLng } from './types';

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle (haversine) distance in meters: precise enough for the few kilometers of a walk. */
export function distanceMeters(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/** True when the point is beyond the zone's radius (RF-009 geofence). */
export function isOutside(zone: { center: LatLng; radiusMeters: number }, point: LatLng): boolean {
  return distanceMeters(zone.center, point) > zone.radiusMeters;
}

/** "450 m" · "1,2 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Rounds to 3 decimals (~110 m): the walker sees the block of a request, not the exact house (design 07 · 28). */
export function blockCenterOf(point: LatLng): LatLng {
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return { latitude: round(point.latitude), longitude: round(point.longitude) };
}

type View = { center: LatLng; zoom: number };

/** Same center (to ~1 cm) and zoom: the map does not need to move. */
export function sameView(a: View | null, b: View): boolean {
  if (a === null) return false;
  const close = (x: number, y: number) => Math.abs(x - y) < 1e-7;
  return (
    a.zoom === b.zoom && close(a.center.latitude, b.center.latitude) && close(a.center.longitude, b.center.longitude)
  );
}
