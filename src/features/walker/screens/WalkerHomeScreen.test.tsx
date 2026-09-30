import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';
import { acceptedWalk, availableWalk } from '@/test/fixtures';
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

    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} />);

    expect(await screen.findByText('Individual · 60 min · 1 perro')).toBeOnTheScreen();
    expect(screen.getByText('Grupal · 45 min · 2 perros')).toBeOnTheScreen();
    expect(screen.getAllByText('Ganas $ 18.400')).toHaveLength(2);
  });

  it('sorts by distance after sharing the location', async () => {
    mockedLocation.mockResolvedValue({ latitude: 4.6361, longitude: -74.0645 });
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [{ ...availableWalk, distanceKm: 1.1 }] },
      { path: '/api/v1/walks/assigned', data: [] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} />);

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
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={onOpenAssigned} />);

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
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: 'Aceptar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Otro paseador ya tomó este paseo. Busca otra solicitud.',
    );
  });

  it('shows the accepted walks and says when there are no requests', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/available', data: [] },
      { path: '/api/v1/walks/assigned', data: [acceptedWalk] },
    ]);
    const onOpenAssigned = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<WalkerHomeScreen onOpenAssigned={onOpenAssigned} />);

    expect(await screen.findByText('No hay solicitudes por ahora.')).toBeOnTheScreen();
    await user.press(await screen.findByRole('button', { name: /Cra 7 # 45-10, Bogotá/ }));

    expect(onOpenAssigned).toHaveBeenCalledWith('walk-1');
  });
});
