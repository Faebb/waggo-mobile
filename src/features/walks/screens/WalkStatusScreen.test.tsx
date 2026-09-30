import { screen, userEvent } from '@testing-library/react-native';

import { luna, requestedWalk } from '@/test/fixtures';
import { envelopeResponse, mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkStatusScreen } from './WalkStatusScreen';

describe('WalkStatusScreen (RF-007)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows that it is looking for a walker, with the walk details', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: requestedWalk },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findByRole('header', { name: 'Buscando paseador…' })).toBeOnTheScreen();
    expect(await screen.findByText('Luna')).toBeOnTheScreen();
    expect(screen.getByText('Individual · 60 min')).toBeOnTheScreen();
    expect(screen.getByText('Cra 7 # 45-10, Bogotá')).toBeOnTheScreen();
    expect(screen.getByText('$ 23.000')).toBeOnTheScreen();
    expect(screen.getByText('Timbre dañado')).toBeOnTheScreen();
  });

  it('cancels the walk', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: requestedWalk },
      { path: '/api/v1/pets', data: [luna] },
      { method: 'POST', path: '/api/v1/walks/walk-1/cancel', data: { ...requestedWalk, status: 'Cancelled' } },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Cancelar paseo' }));

    expect(await screen.findByRole('header', { name: 'Paseo cancelado' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancelar paseo' })).not.toBeOnTheScreen();
  });

  it('shows the live route with its distance and time while the walk is in progress (RF-008)', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/walks/walk-1',
        data: { ...requestedWalk, status: 'InProgress', walkerId: 'w', startedAt: '2026-09-30T15:00:00+00:00' },
      },
      { path: '/api/v1/pets', data: [luna] },
      {
        path: '/api/v1/walks/walk-1/track',
        data: {
          points: [
            { latitude: 4.6361, longitude: -74.0645, recordedAt: '2026-09-30T15:00:00Z' },
            { latitude: 4.645, longitude: -74.0645, recordedAt: '2026-09-30T15:18:00Z' },
          ],
          distanceKm: 0.99,
          elapsedMinutes: 18,
        },
      },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findByRole('header', { name: 'Paseo en curso' })).toBeOnTheScreen();
    expect(await screen.findByText('0,99 km')).toBeOnTheScreen();
    expect(screen.getByText('18 min')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancelar paseo' })).not.toBeOnTheScreen();
  });

  it('refreshes by itself until a walker accepts', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets', data: [luna] }]);
    const answers = [requestedWalk, { ...requestedWalk, status: 'Accepted', walkerId: 'walker-1' }];
    const pets = fetchSpy.getMockImplementation()!;
    fetchSpy.mockImplementation(async (input, init) =>
      String(input).endsWith('/api/v1/walks/walk-1')
        ? envelopeResponse(answers.length > 1 ? answers.shift() : answers[0])
        : pets(input, init),
    );

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" pollIntervalMs={300} />);

    expect(await screen.findByRole('header', { name: 'Buscando paseador…' })).toBeOnTheScreen();
    expect(await screen.findByRole('header', { name: 'Tu paseador va en camino' })).toBeOnTheScreen();
  });
});
