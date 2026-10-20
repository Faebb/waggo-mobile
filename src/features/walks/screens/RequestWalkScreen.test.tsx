import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';
import { fareQuote, luna, max, requestedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { RequestWalkScreen } from './RequestWalkScreen';

jest.mock('@/shared/location/getCurrentLocation');
const mockedLocation = jest.mocked(getCurrentLocation);

const api = (overrides: Parameters<typeof mockApi>[0] = []) =>
  mockApi([
    ...overrides,
    { path: '/api/v1/pets', data: [luna, max] },
    { path: '/api/v1/pricing/quote', data: fareQuote },
    { method: 'POST', path: '/api/v1/walks', data: requestedWalk },
  ]);

function renderScreen(props: Partial<{ onRequested: jest.Mock; onAddPet: jest.Mock }> = {}) {
  return renderWithProviders(<RequestWalkScreen onRequested={jest.fn()} onAddPet={jest.fn()} {...props} />);
}

describe('RequestWalkScreen (RF-007)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedLocation.mockResolvedValue({ latitude: 4.6361, longitude: -74.0645 });
  });

  afterEach(() => fetchSpy?.mockRestore());

  it('requests the walk with the chosen dogs, place and time, showing the price first', async () => {
    fetchSpy = api();
    const onRequested = jest.fn();
    const user = userEvent.setup();
    await renderScreen({ onRequested });

    await user.press(await screen.findByRole('button', { name: 'Luna' }));
    await user.type(screen.getByLabelText('Dirección de recogida'), 'Cra 7 # 45-10, Bogotá');
    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));
    await user.type(screen.getByLabelText('Indicaciones para el paseador'), 'Timbre dañado');

    expect(await screen.findByText('Ubicación lista')).toBeOnTheScreen();
    expect(await screen.findByText('$ 23.000')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Pedir paseo' }));

    await waitFor(() => expect(onRequested).toHaveBeenCalledWith(requestedWalk));
    const post = fetchSpy.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
    expect(JSON.parse(String((post![1] as RequestInit).body))).toEqual({
      petIds: ['pet-luna'],
      walkType: 'Individual',
      durationMinutes: 60,
      pickupAddress: 'Cra 7 # 45-10, Bogotá',
      latitude: 4.6361,
      longitude: -74.0645,
      scheduledFor: null,
      notes: 'Timbre dañado',
    });
  });

  it('asks to choose at least one dog before asking for the walk', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByRole('button', { name: 'Luna' });

    await user.press(screen.getByRole('button', { name: 'Pedir paseo' }));

    expect(screen.getByText('Elige al menos un perro.')).toBeOnTheScreen();
    expect(fetchSpy.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === 'POST')).toBe(false);
  });

  it('asks for the location when the owner did not share it', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();

    await user.press(await screen.findByRole('button', { name: 'Luna' }));
    await user.type(screen.getByLabelText('Dirección de recogida'), 'Cra 7 # 45-10, Bogotá');
    await user.press(screen.getByRole('button', { name: 'Pedir paseo' }));

    expect(screen.getByText('Usa tu ubicación para que el paseador te encuentre.')).toBeOnTheScreen();
  });

  it('explains what to do when the location permission is denied', async () => {
    fetchSpy = api();
    mockedLocation.mockResolvedValue(null);
    const user = userEvent.setup();
    await renderScreen();

    await user.press(await screen.findByRole('button', { name: 'Usar mi ubicación' }));

    expect(
      await screen.findByText('No pudimos obtener tu ubicación. Revisa el permiso de ubicación e intenta de nuevo.'),
    ).toBeOnTheScreen();
  });

  it('sends the owner to add a dog when there are none', async () => {
    fetchSpy = api([{ path: '/api/v1/pets', data: [] }]);
    const onAddPet = jest.fn();
    const user = userEvent.setup();
    await renderScreen({ onAddPet });

    expect(await screen.findByText('Primero agrega a tu perro.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Agregar perro' }));

    expect(onAddPet).toHaveBeenCalledTimes(1);
  });

  it('shows the message of the API when it rejects the walk', async () => {
    fetchSpy = api([
      {
        method: 'POST',
        path: '/api/v1/walks',
        status: 400,
        errors: [
          { code: 'Walks.InvalidSchedule', message: 'Programa el paseo para ahora o para los próximos 14 días.' },
        ],
      },
    ]);
    const user = userEvent.setup();
    await renderScreen();

    await user.press(await screen.findByRole('button', { name: 'Luna' }));
    await user.type(screen.getByLabelText('Dirección de recogida'), 'Cra 7 # 45-10, Bogotá');
    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));
    await screen.findByText('Ubicación lista');
    await user.press(screen.getByRole('button', { name: 'Pedir paseo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Programa el paseo para ahora o para los próximos 14 días.',
    );
  });

  it('tells the owner the total is held, not charged, until the walk happens (RF-016)', async () => {
    fetchSpy = api();
    await renderScreen();

    expect(
      await screen.findByText('Se retiene en tu método de pago y solo se cobra si el paseo ocurre.'),
    ).toBeOnTheScreen();
  });
});
