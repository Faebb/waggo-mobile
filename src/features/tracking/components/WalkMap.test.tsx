import { screen, userEvent } from '@testing-library/react-native';

import { clearMapCommands, emitMapEvent, sentMapCommands } from '@/test/mapBridge';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkMap } from './WalkMap';

const pickup = { latitude: 4.6361, longitude: -74.0645 };
const route = {
  points: [
    { latitude: 4.6361, longitude: -74.0645, recordedAt: '2026-09-30T15:00:00Z' },
    { latitude: 4.645, longitude: -74.0645, recordedAt: '2026-09-30T15:18:00Z' },
  ],
  distanceKm: 0.99,
  elapsedMinutes: 18,
};

describe('WalkMap (RF-008 on OpenStreetMap)', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(clearMapCommands);
  afterEach(() => fetchSpy?.mockRestore());

  it('shows the pickup while the walk has not started', async () => {
    fetchSpy = mockApi([]);
    await renderWithProviders(
      <WalkMap walkId="walk-1" status="Requested" viewer="Owner" pickup={pickup} pickupAddress="Cra 7 # 45-10" />,
    );

    expect(screen.getByLabelText('Mapa con la recogida en Cra 7 # 45-10.')).toBeOnTheScreen();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('draws the live route with the zone, the dog and the metrics', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1/track', data: route },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);
    await renderWithProviders(
      <WalkMap
        walkId="walk-1"
        status="InProgress"
        viewer="Owner"
        pickup={pickup}
        pickupAddress="Cra 7 # 45-10"
        petNames="Luna"
      />,
    );

    expect(await screen.findByText('0,99 km')).toBeOnTheScreen();
    expect(screen.getByText('18 min')).toBeOnTheScreen();
    await emitMapEvent({ type: 'ready' });

    const commands = sentMapCommands();
    expect(commands).toContainEqual(
      expect.objectContaining({ type: 'setGeofence', geofence: { center: pickup, radiusMeters: 1500, alert: false } }),
    );
    const markers = commands.find((command) => command.type === 'setMarkers');
    expect(markers).toMatchObject({
      markers: expect.arrayContaining([expect.objectContaining({ kind: 'dog', text: 'L' })]),
    });
    expect(screen.getByText(/Última posición hace \d+ min/)).toBeOnTheScreen();
  });

  it('frames the whole route at the end', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/track', data: route }]);
    await renderWithProviders(
      <WalkMap walkId="walk-1" status="Completed" viewer="Walker" pickup={pickup} pickupAddress="Cra 7 # 45-10" />,
    );

    expect(await screen.findByLabelText('Mapa con el recorrido completo del paseo: 0,99 km.')).toBeOnTheScreen();
    await emitMapEvent({ type: 'ready' });
    expect(sentMapCommands()).toContainEqual(expect.objectContaining({ type: 'fitBounds' }));
  });

  it('waits for the first position', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1/track', data: { points: [], distanceKm: 0, elapsedMinutes: 0 } },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);
    await renderWithProviders(
      <WalkMap walkId="walk-1" status="InProgress" viewer="Walker" pickup={pickup} pickupAddress="Cra 7 # 45-10" />,
    );

    expect(await screen.findByText('Esperando la primera ubicación…')).toBeOnTheScreen();
  });

  it('reads each metric as one item, the text alternative to the map (design 07 · 16)', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/track', data: route }]);
    await renderWithProviders(
      <WalkMap walkId="walk-1" status="Completed" viewer="Owner" pickup={pickup} pickupAddress="Cra 7 # 45-10" />,
    );

    expect(await screen.findByLabelText('Distancia: 0,99 km')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo: 18 min')).toBeOnTheScreen();
  });

  it('says it is loading the route before the first answer', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/track', data: route }]);
    await renderWithProviders(
      <WalkMap walkId="walk-1" status="Completed" viewer="Owner" pickup={pickup} pickupAddress="Cra 7 # 45-10" />,
    );

    expect(screen.getByText('Cargando el recorrido…')).toBeOnTheScreen();
    expect(await screen.findByText('0,99 km')).toBeOnTheScreen();
    expect(screen.queryByText('Cargando el recorrido…')).not.toBeOnTheScreen();
  });

  it('offers a retry when the route could not be loaded', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1/track', status: 500, errors: [{ code: 'Server.Error', message: 'Falló.' }] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(
      <WalkMap walkId="walk-1" status="Completed" viewer="Owner" pickup={pickup} pickupAddress="Cra 7 # 45-10" />,
    );

    expect(await screen.findByText('No pudimos cargar el recorrido.')).toBeOnTheScreen();
    fetchSpy.mockRestore();
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/track', data: route }]);
    await user.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('0,99 km')).toBeOnTheScreen();
  });
});
