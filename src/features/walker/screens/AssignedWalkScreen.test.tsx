import { Linking } from 'react-native';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getDevicePosition } from '@/shared/location/devicePosition';
import { getCurrentLocation } from '@/shared/location/getCurrentLocation';
import { acceptedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { AssignedWalkScreen } from './AssignedWalkScreen';

jest.mock('@/shared/location/getCurrentLocation');
jest.mock('@/shared/location/devicePosition');
const mockedPosition = jest.mocked(getDevicePosition);
const mockedLocation = jest.mocked(getCurrentLocation);

const inProgress = { ...acceptedWalk, status: 'InProgress', startedAt: '2026-09-30T15:00:00+00:00' };
const emptyRoute = { points: [], distanceKm: 0, elapsedMinutes: 0 };

describe('AssignedWalkScreen (RF-007, RF-008)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => mockedLocation.mockResolvedValue({ latitude: 4.6361, longitude: -74.0645 }));

  afterEach(() => fetchSpy.mockRestore());

  it('shows the accepted walk with the pickup, the notes and the payout', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: acceptedWalk }]);

    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    expect(await screen.findByRole('header', { name: 'Paseo aceptado' })).toBeOnTheScreen();
    expect(screen.getByText('Cra 7 # 45-10, Bogotá')).toBeOnTheScreen();
    expect(screen.getByText('Timbre dañado')).toBeOnTheScreen();
    expect(screen.getByText('Individual · 60 min · 1 perro')).toBeOnTheScreen();
    expect(screen.getByText('$ 18.400')).toBeOnTheScreen();
  });

  it('opens the chat with the owner (RF-013)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);
    const onOpenChat = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" onOpenChat={onOpenChat} />);

    await user.press(await screen.findByRole('button', { name: 'Mensajes' }));

    expect(onOpenChat).toHaveBeenCalledTimes(1);
  });

  it('tells the walker when the owner cancelled', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: { ...acceptedWalk, status: 'Cancelled' } }]);

    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    expect(await screen.findByRole('header', { name: 'El dueño canceló el paseo' })).toBeOnTheScreen();
  });

  it('starts the walk when the walker picks the dogs up', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { method: 'POST', path: '/api/v1/walks/walk-1/start', data: inProgress },
      { path: '/api/v1/walks/walk-1/track', data: emptyRoute },
      { method: 'POST', path: '/api/v1/walks/walk-1/track', data: 1 },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" beaconIntervalMs={50} />);

    await user.press(await screen.findByRole('button', { name: 'Iniciar paseo' }));

    expect(await screen.findByRole('header', { name: 'Paseo en curso' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Terminar paseo' })).toBeOnTheScreen();
  });

  it('shares the position while the walk is in progress', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: inProgress },
      { path: '/api/v1/walks/walk-1/track', data: emptyRoute },
      { method: 'POST', path: '/api/v1/walks/walk-1/track', data: 1 },
    ]);

    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" beaconIntervalMs={50} />);

    await waitFor(() => {
      const sent = fetchSpy.mock.calls.find(
        ([url, init]) => String(url).endsWith('/track') && (init as RequestInit | undefined)?.method === 'POST',
      );
      expect(sent).toBeDefined();
      const body = JSON.parse(String((sent![1] as RequestInit).body)) as { points: { latitude: number }[] };
      expect(body.points[0]!.latitude).toBe(4.6361);
    });
    expect(screen.getByText('Compartiendo tu ubicación con el dueño')).toBeOnTheScreen();
  });

  it('finishes the walk', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: inProgress },
      { path: '/api/v1/walks/walk-1/track', data: emptyRoute },
      { method: 'POST', path: '/api/v1/walks/walk-1/track', data: 1 },
      {
        method: 'POST',
        path: '/api/v1/walks/walk-1/finish',
        data: { ...inProgress, status: 'Completed', finishedAt: '2026-09-30T15:50:00+00:00' },
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" beaconIntervalMs={60_000} />);

    expect(await screen.findByText('Tócalo al entregar a los perros en la recogida.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Terminar paseo' }));
    expect(screen.getByRole('header', { name: '¿Terminar el paseo?' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Confirma que entregaste a los perros en Cra 7 # 45-10, Bogotá. Al terminar se cobra el pago y recibes $ 18.400.',
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Sí, terminar paseo' }));

    expect(await screen.findByRole('header', { name: '¡Paseo terminado!' })).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: '¿Terminar el paseo?' })).not.toBeOnTheScreen();
    expect(screen.getByText('Ganaste $ 18.400')).toBeOnTheScreen();
  });

  it('keeps walking when the walker backs out of finishing', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: inProgress },
      { path: '/api/v1/walks/walk-1/track', data: emptyRoute },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" beaconIntervalMs={60_000} />);

    await user.press(await screen.findByRole('button', { name: 'Terminar paseo' }));
    await user.press(screen.getByRole('button', { name: 'Seguir paseando' }));

    expect(screen.queryByRole('header', { name: '¿Terminar el paseo?' })).not.toBeOnTheScreen();
    expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith('/finish'))).toBe(false);
  });

  it('keeps the finish sheet open with the message of the API when finishing fails', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: inProgress },
      { path: '/api/v1/walks/walk-1/track', data: emptyRoute },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
      {
        method: 'POST',
        path: '/api/v1/walks/walk-1/finish',
        status: 422,
        errors: [{ code: 'Walks.CannotFinish', message: 'Este paseo no está en curso.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" beaconIntervalMs={60_000} />);

    await user.press(await screen.findByRole('button', { name: 'Terminar paseo' }));
    await user.press(screen.getByRole('button', { name: 'Sí, terminar paseo' }));

    expect(await screen.findByText('Este paseo no está en curso.')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: '¿Terminar el paseo?' })).toBeOnTheScreen();
  });

  it('says what to do when the maps app cannot be opened', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no maps'));
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: acceptedWalk }]);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Abrir en Maps' }));

    expect(
      await screen.findByText('No pudimos abrir Maps. Busca la dirección de la recogida en tu app de mapas.'),
    ).toBeOnTheScreen();
    openURL.mockRestore();
  });

  it('opens the pickup in the phone maps app, at no cost for Waggo', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: acceptedWalk }]);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Abrir en Maps' }));

    expect(openURL).toHaveBeenCalledWith('https://www.google.com/maps/search/?api=1&query=4.6361,-74.0645');
    openURL.mockRestore();
  });

  it('shows the pickup on the map and, on demand, how far the walker is in a straight line (design 07 · 29)', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: acceptedWalk }]);
    mockedPosition.mockResolvedValue({
      coordinates: { latitude: 4.6401, longitude: -74.0645 },
      accuracyMeters: 15,
      approximate: false,
    });
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    expect(await screen.findByLabelText('Mapa con la recogida en Cra 7 # 45-10, Bogotá.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Ver mi distancia a la recogida' }));

    expect(await screen.findByLabelText('Mapa: estás a 445 m en línea recta de la recogida.')).toBeOnTheScreen();
  });

  it('explains how to enable the location when it is denied', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: acceptedWalk }]);
    mockedPosition.mockResolvedValue(null);
    const user = userEvent.setup();
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Ver mi distancia a la recogida' }));

    expect(await screen.findByText('No tenemos acceso a tu ubicación.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Ajustes' })).toBeOnTheScreen();
  });

  it('asks to keep the app open while sharing the route (no background location yet)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: inProgress },
      { path: '/api/v1/walks/walk-1/track', data: emptyRoute },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);
    mockedLocation.mockResolvedValue(null);
    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" beaconIntervalMs={60_000} />);

    expect(
      await screen.findByText(
        'Mantén Waggo abierta durante el paseo: si bloqueas el teléfono o cambias de app, dejamos de compartir tu ruta con el dueño.',
      ),
    ).toBeOnTheScreen();
  });
});
