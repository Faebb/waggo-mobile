import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import { luna, requestedWalk } from '@/test/fixtures';
import { envelopeResponse, mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkStatusScreen } from './WalkStatusScreen';

// The first render loads React Native lazily; on a cold cache with parallel workers it can exceed Jest's 5 s default.
jest.setTimeout(30_000);

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

  it('shows the assigned walker by name, and that it is still looking when there is none (RF-007)', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/walks/walk-1',
        data: {
          ...requestedWalk,
          status: 'Accepted',
          walkerId: 'w-1',
          walker: { id: 'w-1', fullName: 'Andrés Gómez' },
        },
      },
      { path: '/api/v1/pets', data: [luna] },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findByText('Paseador: Andrés Gómez')).toBeOnTheScreen();
    expect(screen.queryByText('Buscando paseador…', { exact: true })).not.toBeOnTheScreen();
  });

  it('says it is looking for a walker while nobody accepted (RF-007)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: { ...requestedWalk, walker: null } },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findAllByText('Buscando paseador…')).toHaveLength(2);
  });

  it('opens the chat with the walker once someone accepted (RF-013)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: { ...requestedWalk, status: 'Accepted', walkerId: 'w' } },
      { path: '/api/v1/pets', data: [luna] },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
    ]);
    const onOpenChat = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" onOpenChat={onOpenChat} />);

    await user.press(await screen.findByRole('button', { name: 'Mensajes' }));

    expect(onOpenChat).toHaveBeenCalledTimes(1);
  });

  it('has no chat while looking for a walker', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: requestedWalk },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" onOpenChat={jest.fn()} />);

    await screen.findByRole('header', { name: 'Buscando paseador…' });
    expect(screen.queryByRole('button', { name: 'Mensajes' })).not.toBeOnTheScreen();
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

  describe('status dot', () => {
    const searching = () =>
      mockApi([
        { path: '/api/v1/walks/walk-1', data: requestedWalk },
        { path: '/api/v1/pets', data: [luna] },
      ]);

    afterEach(() => jest.restoreAllMocks());

    it('pulses while looking for a walker', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
      const loop = jest.spyOn(Animated, 'loop');
      fetchSpy = searching();

      await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

      await waitFor(() => expect(loop).toHaveBeenCalled());
    });

    it('does not pulse when the user asked to reduce motion', async () => {
      const reduceMotion = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
      const loop = jest.spyOn(Animated, 'loop');
      fetchSpy = searching();

      await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);
      await screen.findByRole('header', { name: 'Buscando paseador…' });
      await waitFor(() => expect(reduceMotion).toHaveBeenCalled());
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(loop).not.toHaveBeenCalled();
    });
  });
});
