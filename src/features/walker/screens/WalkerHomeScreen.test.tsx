import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';
import { acceptedWalk, availableWalk } from '@/test/fixtures';
import { clearMapCommands, emitMapEvent, sentMapCommands } from '@/test/mapBridge';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkerHomeScreen } from './WalkerHomeScreen';

jest.mock('@/shared/location/getCurrentLocation');
const mockedLocation = jest.mocked(getCurrentLocation);

const secondOffer = { ...availableWalk, id: 'walk-2', walkType: 'Group', durationMinutes: 45, petCount: 2 };

describe('WalkerHomeScreen (RF-007)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('lists the open requests with what the walker earns', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [availableWalk, secondOffer] },
      { path: '/api/v1/walks/assigned', data: [] },
    ]);

    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);

    expect(await screen.findByText('Individual · 60 min · 1 perro')).toBeOnTheScreen();
    expect(screen.getByText('Grupal · 45 min · 2 perros')).toBeOnTheScreen();
    expect(screen.getAllByText('Ganas $ 18.400')).toHaveLength(2);
  });

  it('puts a price pill per request on the map, at the block and not the exact house (design 07 · 28)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [availableWalk, secondOffer] },
      { path: '/api/v1/walks/assigned', data: [] },
    ]);
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);

    expect(
      await screen.findByLabelText('Mapa con 2 solicitudes. La lista de abajo tiene el detalle.'),
    ).toBeOnTheScreen();
    clearMapCommands();
    await emitMapEvent({ type: 'ready' });

    const markers = sentMapCommands().find((command) => command.type === 'setMarkers');
    expect(markers).toMatchObject({
      markers: [
        { id: availableWalk.id, kind: 'offer', text: '$ 18.400', position: { latitude: 4.636, longitude: -74.064 } },
        { id: 'walk-2', kind: 'offer' },
      ],
    });
  });

  it('brings the card of the tapped pill to the top of the list', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [availableWalk, secondOffer] },
      { path: '/api/v1/walks/assigned', data: [] },
    ]);
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);
    await screen.findByText('Grupal · 45 min · 2 perros');

    await emitMapEvent({ type: 'markerTap', id: 'walk-2' });

    const kinds = screen.getAllByText(/ · \d+ min · /).map((node) => node.props.children as string);
    expect(kinds[0]).toBe('Grupal · 45 min · 2 perros');
  });

  it('sorts by distance after sharing the location', async () => {
    mockedLocation.mockResolvedValue({ latitude: 4.6361, longitude: -74.0645 });
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [{ ...availableWalk, distanceKm: 1.1 }] },
      { path: '/api/v1/walks/assigned', data: [] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: 'Ver las más cercanas' }));

    expect(await screen.findByText('a 1,1 km')).toBeOnTheScreen();
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('latitude=4.6361&longitude=-74.0645'))).toBe(true);
  });

  it('accepts a request and opens it', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [availableWalk] },
      { path: '/api/v1/walks/assigned', data: [] },
      { method: 'POST', path: '/api/v1/walks/walk-1/accept', data: acceptedWalk },
    ]);
    const onOpenAssigned = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={onOpenAssigned} onOpenNotifications={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: 'Aceptar' }));

    await waitFor(() => expect(onOpenAssigned).toHaveBeenCalledWith('walk-1'));
  });

  it('explains when another walker took it first', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [availableWalk] },
      { path: '/api/v1/walks/assigned', data: [] },
      {
        method: 'POST',
        path: '/api/v1/walks/walk-1/accept',
        status: 409,
        errors: [{ code: 'Walks.NotAvailable', message: 'Otro paseador ya tomó este paseo. Busca otra solicitud.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: 'Aceptar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Otro paseador ya tomó este paseo. Busca otra solicitud.',
    );
  });

  it('offers to try again when the requests could not be loaded, without an empty map', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/walks/available',
        status: 500,
        errors: [{ code: 'Server.Error', message: 'Falló.' }],
      },
      { path: '/api/v1/walks/assigned', data: [] },
    ]);

    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);

    expect(await screen.findByText('No pudimos cargar las solicitudes.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeOnTheScreen();
    expect(screen.queryByTestId('waggo-map-webview')).not.toBeOnTheScreen();
    expect(screen.queryByText('No hay solicitudes cerca por ahora')).not.toBeOnTheScreen();
  });

  it('shows the walk under way and says when there are no requests nearby', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [] },
      { path: '/api/v1/walks/assigned', data: [acceptedWalk] },
    ]);
    const onOpenAssigned = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={onOpenAssigned} onOpenNotifications={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'No hay solicitudes cerca por ahora' })).toBeOnTheScreen();
    await user.press(await screen.findByRole('button', { name: /Cra 7 # 45-10, Bogotá/ }));

    expect(onOpenAssigned).toHaveBeenCalledWith('walk-1');
  });

  it('opens the notices from the bell (RF-014)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [] },
      { path: '/api/v1/walks/assigned', data: [] },
      { path: '/api/v1/notifications', data: { unreadCount: 0, items: [] } },
    ]);
    const onOpenNotifications = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={onOpenNotifications} />,
    );

    await user.press(await screen.findByRole('button', { name: 'Avisos' }));

    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('marks a request taken by someone else as no longer available (409)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [availableWalk] },
      { path: '/api/v1/walks/assigned', data: [] },
      {
        method: 'POST',
        path: '/api/v1/walks/walk-1/accept',
        status: 409,
        errors: [{ code: 'Walks.NotAvailable', message: 'Otro paseador ya tomó este paseo. Busca otra solicitud.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} onOpenNotifications={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: 'Aceptar' }));

    expect(await screen.findByText('Ya no disponible')).toBeOnTheScreen();
  });
});
