import type { DevicePosition } from '@/shared/location/devicePosition';
import { PLACE_ZOOM } from '@/shared/map/mapConfig';
import { distanceMeters, formatDistance, isOutside } from '@/shared/map/geo';
import type { Geofence, LatLng, MapMarker, MapRoute } from '@/shared/map/types';

import { alertTitleFor, type AlertParty, type WalkAlert } from './alerts';
import { formatKm } from './formatMetrics';
import type { Route } from './types';

/** Radius of the agreed zone around the pickup (RF-009, ⚠️ provisional). */
export const GEOFENCE_RADIUS_METERS = 1500;
/** A position older than this greys the walker out (design 04 · 2, ⚠️ provisional). */
export const STALE_AFTER_MS = 60_000;

/** Same values as the walk status; kept here so tracking does not depend on the walks feature. */
export type WalkPhase = 'Requested' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled';

export type SceneInput = {
  status: WalkPhase;
  viewer: AlertParty;
  pickup: LatLng;
  pickupAddress: string;
  /** "Luna" or "Luna y Max": the owner sees the dog on the map. */
  petNames?: string;
  route?: Route | null;
  alerts?: WalkAlert[];
  /** The walker's own position before starting (shared on demand). */
  walkerPosition?: DevicePosition | null;
  now: number;
};

export type WalkMapScene = {
  center: LatLng;
  zoom: number;
  markers: MapMarker[];
  route: MapRoute | null;
  geofence: Geofence | null;
  fitTo?: LatLng[];
  follow: boolean;
  /** Spoken summary of the map (design 07 · 16). */
  label: string;
  /** Minutes since the last position when it is old, else null. */
  staleMinutes: number | null;
};

const toLatLng = ({ latitude, longitude }: LatLng): LatLng => ({ latitude, longitude });

function ago(ms: number): string {
  return ms < 60_000 ? `${Math.max(0, Math.round(ms / 1000))} s` : `${Math.floor(ms / 60_000)} min`;
}

/**
 * What the walk map shows for a status and viewer: markers, route, zone, framing and its spoken summary. Pure, so
 * the rules of design 04 (dog stuck to the walker, red zone when outside, grey after a minute without signal)
 * are tested without a map.
 */
export function walkMapScene(input: SceneInput): WalkMapScene {
  const { status, viewer, pickup, pickupAddress, now } = input;
  const pickupMarker: MapMarker = {
    id: 'pickup',
    kind: 'pickup',
    position: pickup,
    label: `Recogida: ${pickupAddress}`,
  };
  const points = (input.route?.points ?? []).map(toLatLng);
  const scene: WalkMapScene = {
    center: pickup,
    zoom: PLACE_ZOOM,
    markers: [pickupMarker],
    route: null,
    geofence: null,
    follow: false,
    label: `Mapa con la recogida en ${pickupAddress}.`,
    staleMinutes: null,
  };

  if (status === 'Accepted' && viewer === 'Walker' && input.walkerPosition) {
    const me = input.walkerPosition.coordinates;
    scene.markers = [
      pickupMarker,
      {
        id: 'me',
        kind: 'walker',
        position: me,
        text: 'Tú',
        label: 'Tu ubicación',
        ...(input.walkerPosition.accuracyMeters !== null && { accuracyMeters: input.walkerPosition.accuracyMeters }),
      },
    ];
    scene.route = { walked: [], pending: [me, pickup] };
    scene.fitTo = [me, pickup];
    scene.label = `Mapa: estás a ${formatDistance(distanceMeters(me, pickup))} en línea recta de la recogida.`;
    return scene;
  }

  if (status === 'Completed' && points.length > 0) {
    scene.route = { walked: points, pending: [] };
    scene.fitTo = [...points, pickup];
    scene.label = `Mapa con el recorrido completo del paseo: ${formatKm(input.route?.distanceKm ?? 0)}.`;
    return scene;
  }

  if (status !== 'InProgress') return scene;

  scene.geofence = { center: pickup, radiusMeters: GEOFENCE_RADIUS_METERS, alert: false };
  const lastPoint = input.route?.points.at(-1);
  if (lastPoint === undefined) {
    scene.label = `Mapa del paseo: esperando la primera ubicación. Recogida en ${pickupAddress}.`;
    return scene;
  }

  const last = toLatLng(lastPoint);
  const age = now - Date.parse(lastPoint.recordedAt);
  const stale = age > STALE_AFTER_MS;
  const outside = isOutside(scene.geofence, last);
  const isOwner = viewer === 'Owner';
  const names = input.petNames ?? 'Tu perro';
  const alertMarkers: MapMarker[] = (input.alerts ?? []).flatMap((alert) =>
    alert.latitude !== null && alert.longitude !== null
      ? [
          {
            id: `alert-${alert.id}`,
            kind: 'alert' as const,
            position: { latitude: alert.latitude, longitude: alert.longitude },
            label: `Alerta: ${alertTitleFor(alert, viewer)}`,
          },
        ]
      : [],
  );

  scene.geofence.alert = outside;
  scene.route = { walked: points, pending: [] };
  scene.center = last;
  scene.follow = true;
  scene.staleMinutes = stale ? Math.floor(age / 60_000) : null;
  scene.markers = [
    pickupMarker,
    ...alertMarkers,
    {
      id: 'walker',
      kind: isOwner ? 'dog' : 'walker',
      position: last,
      text: isOwner ? names.charAt(0).toUpperCase() : 'Tú',
      stale,
      label: `${isOwner ? `${names} con tu paseador` : 'Tu ubicación'}, actualizado hace ${ago(age)}`,
    },
  ];
  const where = formatDistance(distanceMeters(last, pickup));
  scene.label =
    `Mapa del paseo: ${isOwner ? `${names} a` : 'estás a'} ${where} de la recogida, actualizado hace ${ago(age)}.` +
    (outside ? ' Fuera de la zona acordada.' : '');
  return scene;
}
