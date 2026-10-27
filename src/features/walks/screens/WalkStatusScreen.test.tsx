import { fireEvent, screen, userEvent } from '@testing-library/react-native';

import { acceptedWalk, luna, requestedWalk } from '@/test/fixtures';
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

  it('shows the pickup on the OpenStreetMap map while it looks for a walker (design 07 · 14)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: requestedWalk },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findByLabelText('Mapa con la recogida en Cra 7 # 45-10, Bogotá.')).toBeOnTheScreen();
    expect(screen.getByTestId('waggo-map-webview')).toBeOnTheScreen();
  });

  it('describes where the dog is on the live map (design 07 · 16)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: { ...requestedWalk, status: 'InProgress', walkerId: 'w' } },
      { path: '/api/v1/pets', data: [luna] },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
      {
        path: '/api/v1/walks/walk-1/track',
        data: {
          points: [
            {
              latitude: requestedWalk.latitude + 0.0054,
              longitude: requestedWalk.longitude,
              recordedAt: '2026-09-30T15:18:00Z',
            },
          ],
          distanceKm: 0.6,
          elapsedMinutes: 10,
        },
      },
    ]);

    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findByLabelText(/^Mapa del paseo: Luna a 600 m de la recogida/)).toBeOnTheScreen();
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
    expect(screen.getByRole('header', { name: '¿Cancelar el paseo?' })).toBeOnTheScreen();
    expect(screen.getByText('Liberamos los $ 23.000 retenidos.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Sí, cancelar paseo' }));

    expect(await screen.findByRole('header', { name: 'Paseo cancelado' })).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: '¿Cancelar el paseo?' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancelar paseo' })).not.toBeOnTheScreen();
  });

  it('keeps the cancel sheet open with the message of the API when cancelling fails', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/pets', data: [luna] },
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
      {
        method: 'POST',
        path: '/api/v1/walks/walk-1/cancel',
        status: 422,
        errors: [{ code: 'Walks.CannotCancel', message: 'Este paseo ya no se puede cancelar.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Cancelar paseo' }));
    await user.press(screen.getByRole('button', { name: 'Sí, cancelar paseo' }));

    expect(await screen.findByText('Este paseo ya no se puede cancelar.')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: '¿Cancelar el paseo?' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'No, mantener el paseo' })).toBeOnTheScreen();
  });

  it('closes the cancel sheet with the back button or the Escape key', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: requestedWalk },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Cancelar paseo' }));
    await fireEvent(screen.getByTestId('bottom-sheet'), 'requestClose');

    expect(screen.queryByRole('header', { name: '¿Cancelar el paseo?' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancelar paseo' })).toBeOnTheScreen();
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

  it('keeps the walk when the owner backs out of cancelling', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: requestedWalk },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    await user.press(await screen.findByRole('button', { name: 'Cancelar paseo' }));
    await user.press(screen.getByRole('button', { name: 'No, seguir buscando' }));

    expect(screen.queryByRole('header', { name: '¿Cancelar el paseo?' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancelar paseo' })).toBeOnTheScreen();
    expect(fetchSpy.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === 'POST')).toBe(false);
  });

  it('shows the verified walker once someone accepted', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" />);

    expect(await screen.findByText('Paseador verificado')).toBeOnTheScreen();
  });

  it('offers to ask for another walk when it ended (RF-011)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: { ...requestedWalk, status: 'Completed', walkerId: 'dev-walker' } },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    const onRequestAgain = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<WalkStatusScreen walkId="walk-1" onRequestAgain={onRequestAgain} />);

    expect(await screen.findByRole('header', { name: 'Luna volvió a casa' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Pedir otro paseo' }));

    expect(onRequestAgain).toHaveBeenCalledTimes(1);
  });
});
