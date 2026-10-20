import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';
import { acceptedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { AssignedWalkScreen } from './AssignedWalkScreen';

jest.mock('@/shared/location/getCurrentLocation');
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

    await user.press(await screen.findByRole('button', { name: 'Terminar paseo' }));

    expect(await screen.findByRole('header', { name: 'Paseo terminado' })).toBeOnTheScreen();
  });
});
