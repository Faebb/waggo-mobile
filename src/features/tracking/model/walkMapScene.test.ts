import { GEOFENCE_RADIUS_METERS, walkMapScene, type SceneInput } from './walkMapScene';

const pickup = { latitude: 4.6361, longitude: -74.0645 };
const now = Date.parse('2026-09-30T15:18:10Z');
const base: SceneInput = {
  status: 'InProgress',
  viewer: 'Owner',
  pickup,
  pickupAddress: 'Cra 7 # 45-10',
  petNames: 'Luna',
  now,
};
const route = {
  points: [
    { latitude: 4.6361, longitude: -74.0645, recordedAt: '2026-09-30T15:00:00Z' },
    { latitude: 4.6415, longitude: -74.0645, recordedAt: '2026-09-30T15:18:00Z' },
  ],
  distanceKm: 0.99,
  elapsedMinutes: 18,
};

describe('walkMapScene (design 04 and 07 · 14–18, 29–30)', () => {
  it('shows only the pickup while looking for a walker', () => {
    const scene = walkMapScene({ ...base, status: 'Requested' });

    expect(scene.markers).toEqual([
      { id: 'pickup', kind: 'pickup', position: pickup, label: 'Recogida: Cra 7 # 45-10' },
    ]);
    expect(scene.center).toEqual(pickup);
    expect(scene.route).toBeNull();
    expect(scene.geofence).toBeNull();
    expect(scene.label).toBe('Mapa con la recogida en Cra 7 # 45-10.');
  });

  it('follows the dog with the walker during the walk, inside the agreed zone', () => {
    const scene = walkMapScene({ ...base, route });

    expect(scene.markers).toContainEqual({
      id: 'walker',
      kind: 'dog',
      position: { latitude: 4.6415, longitude: -74.0645 },
      text: 'L',
      stale: false,
      label: 'Luna con tu paseador, actualizado hace 10 s',
    });
    expect(scene.route).toEqual({
      walked: route.points.map(({ latitude, longitude }) => ({ latitude, longitude })),
      pending: [],
    });
    expect(scene.geofence).toEqual({ center: pickup, radiusMeters: GEOFENCE_RADIUS_METERS, alert: false });
    expect(scene.center).toEqual({ latitude: 4.6415, longitude: -74.0645 });
    expect(scene.follow).toBe(true);
    expect(scene.label).toBe('Mapa del paseo: Luna a 600 m de la recogida, actualizado hace 10 s.');
  });

  it('turns the zone red and marks the alert when the walk leaves it (RF-009)', () => {
    const far = { latitude: 4.6561, longitude: -74.0645, recordedAt: '2026-09-30T15:18:00Z' };
    const scene = walkMapScene({
      ...base,
      route: { ...route, points: [...route.points, far] },
      alerts: [
        {
          id: 'a1',
          kind: 'Geofence',
          raisedBy: null,
          message: null,
          latitude: 4.6561,
          longitude: -74.0645,
          raisedAt: '2026-09-30T15:17:00Z',
        },
        {
          id: 'a2',
          kind: 'Emergency',
          raisedBy: 'Owner',
          message: null,
          latitude: null,
          longitude: null,
          raisedAt: '',
        },
      ],
    });

    expect(scene.geofence?.alert).toBe(true);
    expect(scene.markers.filter((marker) => marker.kind === 'alert')).toEqual([
      {
        id: 'alert-a1',
        kind: 'alert',
        position: { latitude: 4.6561, longitude: -74.0645 },
        label: 'Alerta: El paseo salió de la zona acordada',
      },
    ]);
    expect(scene.label).toContain('Fuera de la zona acordada.');
  });

  it('greys the marker out when the last position is more than 30 seconds old', () => {
    const scene = walkMapScene({ ...base, route, now: Date.parse('2026-09-30T15:21:00Z') });

    expect(scene.markers.find((marker) => marker.id === 'walker')).toMatchObject({
      stale: true,
      label: 'Luna con tu paseador, actualizado hace 3 min',
    });
    expect(scene.staleAgo).toBe('3 min');
  });

  it('keeps the marker active at 30 seconds and greys it out right after (PO: 30 s threshold)', () => {
    const at = (seconds: number) =>
      walkMapScene({ ...base, route, now: Date.parse('2026-09-30T15:18:00Z') + seconds * 1000 });

    expect(at(30).staleAgo).toBeNull();
    expect(at(31).staleAgo).toBe('31 s');
    expect(at(31).markers.find((marker) => marker.id === 'walker')).toMatchObject({ stale: true });
  });

  it('waits for the first position', () => {
    const scene = walkMapScene({ ...base, route: { points: [], distanceKm: 0, elapsedMinutes: 0 } });

    expect(scene.label).toBe('Mapa del paseo: esperando la primera ubicación. Recogida en Cra 7 # 45-10.');
    expect(scene.center).toEqual(pickup);
  });

  it('shows the walker as "Tú" on the walker phone', () => {
    const scene = walkMapScene({ ...base, viewer: 'Walker', route });

    expect(scene.markers).toContainEqual(expect.objectContaining({ id: 'walker', kind: 'walker', text: 'Tú' }));
    expect(scene.label).toBe('Mapa del paseo: estás a 600 m de la recogida, actualizado hace 10 s.');
  });

  it('draws the dashed way from the walker to the pickup before starting (straight line)', () => {
    const me = { latitude: 4.6401, longitude: -74.0645 };
    const scene = walkMapScene({
      ...base,
      status: 'Accepted',
      viewer: 'Walker',
      walkerPosition: { coordinates: me, accuracyMeters: 20, approximate: false },
    });

    expect(scene.route).toEqual({ walked: [], pending: [me, pickup] });
    expect(scene.markers).toContainEqual(
      expect.objectContaining({ id: 'me', kind: 'walker', position: me, accuracyMeters: 20 }),
    );
    expect(scene.fitTo).toEqual([me, pickup]);
    expect(scene.label).toBe('Mapa: estás a 445 m en línea recta de la recogida.');
  });

  it('frames the whole route in the summary', () => {
    const scene = walkMapScene({ ...base, status: 'Completed', route });

    expect(scene.fitTo).toEqual([pickup, { latitude: 4.6415, longitude: -74.0645 }, pickup]);
    expect(scene.geofence).toBeNull();
    expect(scene.follow).toBe(false);
    expect(scene.label).toBe('Mapa con el recorrido completo del paseo: 0,99 km.');
  });
});
