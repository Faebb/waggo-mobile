import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getDevicePosition, getLocationPermission } from '@/shared/location/devicePosition';
import { fareQuote, luna, max, requestedWalk } from '@/test/fixtures';
import { clearMapCommands, emitMapEvent, sentMapCommands } from '@/test/mapBridge';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { RequestWalkScreen } from './RequestWalkScreen';

jest.mock('@/shared/location/devicePosition');
const mockedPosition = jest.mocked(getDevicePosition);
const mockedPermission = jest.mocked(getLocationPermission);

const here = { coordinates: { latitude: 4.6361, longitude: -74.0645 }, accuracyMeters: 10, approximate: false };

type User = ReturnType<typeof userEvent.setup>;

const api = (overrides: Parameters<typeof mockApi>[0] = []) =>
  mockApi([
    ...overrides,
    { path: '/api/v1/pets', data: [luna, max] },
    { path: '/api/v1/pricing/quote', data: fareQuote },
    { method: 'POST', path: '/api/v1/walks', data: requestedWalk },
  ]);

/** Answers Nominatim (OSM search) with `body` and leaves waggo-api to the fake of `mockApi`. */
function withNominatim(fetchSpy: jest.SpyInstance, body: unknown) {
  const waggoApi = fetchSpy.getMockImplementation() as (input: unknown, init?: RequestInit) => Promise<Response>;
  fetchSpy.mockImplementation(async (input: unknown, init?: RequestInit) =>
    String(input).startsWith('https://nominatim.openstreetmap.org/')
      ? new Response(JSON.stringify(body))
      : waggoApi(input, init),
  );
  return fetchSpy;
}

function renderScreen(props: Partial<{ onRequested: jest.Mock; onAddPet: jest.Mock }> = {}) {
  return renderWithProviders(<RequestWalkScreen onRequested={jest.fn()} onAddPet={jest.fn()} {...props} />);
}

/** Step 1 · ¿Dónde?: the address plus the phone location. */
async function confirmPickup(user: User) {
  await user.type(screen.getByLabelText('Dirección de recogida'), 'Cra 7 # 45-10, Bogotá');
  await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));
  await screen.findByText('Ubicación lista');
  await user.press(screen.getByRole('button', { name: 'Confirmar recogida' }));
}

/** Step 2 · ¿Quién y cuánto?: Luna, with notes. */
async function chooseLuna(user: User) {
  await user.press(await screen.findByRole('button', { name: 'Luna' }));
  await user.type(screen.getByLabelText('Indicaciones para el paseador (opcional)'), 'Timbre dañado');
  await user.press(screen.getByRole('button', { name: 'Continuar' }));
}

/** Nominatim answers at most once per second (shared rate limit), so its results can take a bit longer. */
const NOMINATIM_WAIT = { timeout: 3000 };

const hasPost = (fetchSpy: jest.SpyInstance) =>
  fetchSpy.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === 'POST');

describe('RequestWalkScreen (RF-007, three steps of design proposal 07 · 11–13)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    clearMapCommands();
    mockedPermission.mockResolvedValue('granted');
    mockedPosition.mockResolvedValue(here);
  });

  afterEach(() => fetchSpy?.mockRestore());

  it('requests the walk in three steps — where, who and how much, confirm — showing the price first', async () => {
    fetchSpy = api();
    const onRequested = jest.fn();
    const user = userEvent.setup();
    await renderScreen({ onRequested });

    expect(screen.getByText('Paso 1 de 3')).toBeOnTheScreen();
    await confirmPickup(user);

    expect(screen.getByText('Paso 2 de 3')).toBeOnTheScreen();
    expect(await screen.findByText('$ 23.000')).toBeOnTheScreen();
    await chooseLuna(user);

    expect(screen.getByText('Paso 3 de 3')).toBeOnTheScreen();
    expect(screen.getByText('Cra 7 # 45-10, Bogotá')).toBeOnTheScreen();
    expect(screen.getByText('Incluye la comisión de Waggo ($ 4.600)')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Pedir paseo · $ 23.000' }));

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
  }, 20000);

  it('asks to choose at least one dog before going on', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);
    await screen.findByRole('button', { name: 'Luna' });

    await user.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Elige al menos un perro.')).toBeOnTheScreen();
    expect(screen.getByText('Paso 2 de 3')).toBeOnTheScreen();
    expect(hasPost(fetchSpy)).toBe(false);
  }, 15000);

  it('asks for the address and the point before confirming the pickup', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Confirmar recogida' }));

    expect(screen.getByText('Escribe la dirección de recogida.')).toBeOnTheScreen();
    expect(
      screen.getByText('Busca la dirección, usa tu ubicación o mueve el mapa hasta la recogida.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Paso 1 de 3')).toBeOnTheScreen();
  });

  it('explains what to do when the location permission is denied, with a way to open Settings', async () => {
    fetchSpy = api();
    mockedPosition.mockResolvedValue(null);
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    expect(await screen.findByText('No tenemos acceso a tu ubicación.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Ajustes' })).toBeOnTheScreen();
  });

  it('sends the owner to add a dog when there are none', async () => {
    fetchSpy = api([{ path: '/api/v1/pets', data: [] }]);
    const onAddPet = jest.fn();
    const user = userEvent.setup();
    await renderScreen({ onAddPet });
    await confirmPickup(user);

    expect(await screen.findByText('Agrega a tu perro para pedir')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Agregar mi perro' }));

    expect(onAddPet).toHaveBeenCalledTimes(1);
  });

  it('schedules the walk for another date and time typed by the owner (design 07 · 12)', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);
    const day = new Date();
    day.setDate(day.getDate() + 2);
    const dateText = [day.getDate(), day.getMonth() + 1].map((part) => String(part).padStart(2, '0')).join('/');

    await user.press(await screen.findByRole('button', { name: 'Luna' }));
    await user.press(screen.getByRole('button', { name: 'Otra fecha' }));
    expect(screen.getByText('Puedes programar hasta 5 días desde hoy.')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Fecha'), `${dateText}/${day.getFullYear()}`);
    await user.type(screen.getByLabelText('Hora'), '0830');
    expect(screen.getByLabelText('Hora')).toHaveDisplayValue('08:30');
    await user.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Paso 3 de 3')).toBeOnTheScreen();
    expect(screen.getByText(/, 8:30$/)).toBeOnTheScreen();
    await user.press(await screen.findByRole('button', { name: 'Pedir paseo · $ 23.000' }));

    await waitFor(() => expect(hasPost(fetchSpy)).toBe(true));
    const post = fetchSpy.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
    const body = JSON.parse(String((post![1] as RequestInit).body)) as { scheduledFor: string };
    expect(body.scheduledFor).toBe(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 8, 30).toISOString());
  }, 20000);

  it('marks the date and the time when they are not valid', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);

    await user.press(await screen.findByRole('button', { name: 'Luna' }));
    await user.press(screen.getByRole('button', { name: 'Otra fecha' }));
    await user.type(screen.getByLabelText('Fecha'), '31022026');
    await user.type(screen.getByLabelText('Hora'), '2500');
    await user.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Escribe una fecha real como día/mes/año, por ejemplo 02/10/2026.')).toBeOnTheScreen();
    expect(screen.getByText('Escribe la hora de 0:00 a 23:59, por ejemplo 14:30.')).toBeOnTheScreen();
    expect(screen.getByText('Paso 2 de 3')).toBeOnTheScreen();
  }, 20000);

  it('does not schedule further than the 5 days the API accepts', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);
    const day = new Date();
    day.setDate(day.getDate() + 10);
    const dateText = [day.getDate(), day.getMonth() + 1].map((part) => String(part).padStart(2, '0')).join('/');

    await user.press(await screen.findByRole('button', { name: 'Luna' }));
    await user.press(screen.getByRole('button', { name: 'Otra fecha' }));
    await user.type(screen.getByLabelText('Fecha'), `${dateText}/${day.getFullYear()}`);
    await user.type(screen.getByLabelText('Hora'), '0800');
    await user.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Puedes programar el paseo hasta 5 días desde ahora.')).toBeOnTheScreen();
    expect(screen.getByText('Paso 2 de 3')).toBeOnTheScreen();
  }, 20000);

  it('goes back to step 2 with the message of the API when it rejects the schedule', async () => {
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
    await confirmPickup(user);
    await chooseLuna(user);
    await screen.findByText('$ 23.000');

    await user.press(screen.getByRole('button', { name: 'Pedir paseo · $ 23.000' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Programa el paseo para ahora o para los próximos 14 días.',
    );
    expect(screen.getByText('Paso 2 de 3')).toBeOnTheScreen();
  }, 20000);

  it('stays on the confirmation with the message of the API when the payment is declined (RF-015)', async () => {
    fetchSpy = api([
      {
        method: 'POST',
        path: '/api/v1/walks',
        status: 400,
        errors: [{ code: 'Payments.Declined', message: 'Tu método de pago fue rechazado.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);
    await chooseLuna(user);
    await screen.findByText('$ 23.000');

    await user.press(screen.getByRole('button', { name: 'Pedir paseo · $ 23.000' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Tu método de pago fue rechazado.');
    expect(screen.getByText('Paso 3 de 3')).toBeOnTheScreen();
  }, 20000);

  it('tells the owner the total is held, not charged, until the walk happens (RF-016)', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);
    await chooseLuna(user);

    expect(
      await screen.findByText(
        'Retenemos $ 23.000 y solo se cobra si el paseo ocurre. Si cancelas antes de que empiece, se libera.',
      ),
    ).toBeOnTheScreen();
  }, 15000);

  it('goes back one step without losing what was chosen', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);

    await user.press(screen.getByRole('button', { name: 'Volver al paso anterior' }));

    expect(screen.getByText('Paso 1 de 3')).toBeOnTheScreen();
    expect(screen.getByLabelText('Dirección de recogida')).toHaveDisplayValue('Cra 7 # 45-10, Bogotá');
  });

  it('comes with the dog preselected from its detail', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderWithProviders(
      <RequestWalkScreen onRequested={jest.fn()} onAddPet={jest.fn()} initialPetIds={['pet-luna']} />,
    );
    await confirmPickup(user);

    expect(await screen.findByRole('button', { name: 'Luna' })).toBeSelected();
  });

  it('explains why it needs the location before the system asks (design 04 · 5)', async () => {
    fetchSpy = api();
    mockedPermission.mockResolvedValue('undetermined');
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    expect(
      screen.getByText(
        'Para encontrar paseadores cerca y mostrar la recogida, Waggo usa tu ubicación mientras usas la app.',
      ),
    ).toBeOnTheScreen();
    expect(mockedPosition).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Permitir ubicación' }));

    expect(await screen.findByText('Ubicación lista')).toBeOnTheScreen();
    expect(mockedPosition).toHaveBeenCalledTimes(1);
  });

  it('lets the owner write the address instead of sharing the location', async () => {
    fetchSpy = api();
    mockedPermission.mockResolvedValue('undetermined');
    const user = userEvent.setup();
    await renderScreen();
    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    await user.press(screen.getByRole('button', { name: 'Escribir la dirección' }));

    expect(screen.queryByRole('button', { name: 'Permitir ubicación' })).not.toBeOnTheScreen();
    expect(mockedPosition).not.toHaveBeenCalled();
  });

  it('centers the map on the phone location and warns when it is approximate', async () => {
    fetchSpy = api();
    mockedPosition.mockResolvedValue({ ...here, approximate: true });
    const user = userEvent.setup();
    await renderScreen();
    await emitMapEvent({ type: 'ready' });

    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    expect(
      await screen.findByText("Tu ubicación es aproximada. Activa 'Ubicación precisa' o ajusta el pin."),
    ).toBeOnTheScreen();
    expect(sentMapCommands()).toContainEqual({ type: 'setView', center: here.coordinates, zoom: 15 });
  });

  it('warns when the GPS signal is weak', async () => {
    fetchSpy = api();
    mockedPosition.mockResolvedValue({ ...here, accuracyMeters: 120 });
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    expect(await screen.findByText('Señal GPS débil. La posición puede variar.')).toBeOnTheScreen();
  });

  it('finds the address with the search and sends its point (Nominatim, on "Buscar")', async () => {
    fetchSpy = withNominatim(api(), [
      {
        place_id: 7,
        lat: '10.4631',
        lon: '-73.2532',
        display_name: 'Calle 16, Centro, Valledupar',
        address: { road: 'Calle 16', house_number: '10-20', suburb: 'Centro', city: 'Valledupar' },
      },
    ]);
    const onRequested = jest.fn();
    const user = userEvent.setup();
    await renderScreen({ onRequested });

    await user.type(screen.getByLabelText('Buscar dirección'), 'Calle 16 10-20 Valledupar');
    await user.press(screen.getByRole('button', { name: 'Buscar' }));
    await user.press(
      await screen.findByRole('button', { name: 'Calle 16 # 10-20, Centro · Valledupar' }, NOMINATIM_WAIT),
    );

    expect(screen.getByLabelText('Dirección de recogida')).toHaveDisplayValue('Calle 16 # 10-20, Centro, Valledupar');
    await user.press(screen.getByRole('button', { name: 'Confirmar recogida' }));
    await chooseLuna(user);
    await screen.findByText('$ 23.000');
    await user.press(screen.getByRole('button', { name: 'Pedir paseo · $ 23.000' }));

    await waitFor(() => expect(onRequested).toHaveBeenCalled());
    const post = fetchSpy.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
    expect(JSON.parse(String((post![1] as RequestInit).body))).toMatchObject({
      pickupAddress: 'Calle 16 # 10-20, Centro, Valledupar',
      latitude: 10.4631,
      longitude: -73.2532,
    });
  }, 20000);

  it('takes the point under the pin when the owner moves the map, and fills in its address', async () => {
    fetchSpy = withNominatim(api(), {
      place_id: 8,
      lat: '10.47',
      lon: '-73.25',
      display_name: 'Carrera 9, Valledupar',
      address: { road: 'Carrera 9', city: 'Valledupar' },
    });
    const user = userEvent.setup();
    await renderScreen();

    await emitMapEvent({ type: 'moveStart' });
    expect(screen.getByText('Suelta para elegir este punto.')).toBeOnTheScreen();
    await emitMapEvent({ type: 'moveEnd', center: { latitude: 10.47, longitude: -73.25 }, zoom: 16, byUser: true });

    expect(await screen.findByDisplayValue('Carrera 9, Valledupar', {}, NOMINATIM_WAIT)).toBeOnTheScreen();
    expect(screen.getByText('Ubicación lista')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Confirmar recogida' }));
    expect(screen.getByText('Paso 2 de 3')).toBeOnTheScreen();
  });

  it('does not replace an address the owner typed when the pin moves', async () => {
    fetchSpy = withNominatim(api(), {
      place_id: 9,
      lat: '10.48',
      lon: '-73.26',
      display_name: 'Carrera 4, Valledupar',
      address: { road: 'Carrera 4', city: 'Valledupar' },
    });
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByLabelText('Dirección de recogida'), 'Cra 4 # 12-30 apto 201');

    await emitMapEvent({ type: 'moveEnd', center: { latitude: 10.48, longitude: -73.26 }, zoom: 17, byUser: true });

    await waitFor(
      () => expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('/reverse?'))).toBe(true),
      NOMINATIM_WAIT,
    );
    expect(screen.getByLabelText('Dirección de recogida')).toHaveDisplayValue('Cra 4 # 12-30 apto 201');
  });

  it('asks to zoom in before taking a point from a far view', async () => {
    fetchSpy = api();
    await renderScreen();

    await emitMapEvent({ type: 'moveEnd', center: { latitude: 10.5, longitude: -73.3 }, zoom: 10, byUser: true });

    expect(screen.getByText('Acerca el mapa para elegir el punto exacto.')).toBeOnTheScreen();
    expect(screen.queryByText('Ubicación lista')).not.toBeOnTheScreen();
  });

  it('shows a small map of the pickup on the confirmation (design 07 · 13)', async () => {
    fetchSpy = api();
    const user = userEvent.setup();
    await renderScreen();
    await confirmPickup(user);
    await chooseLuna(user);

    expect(screen.getByText('Paso 3 de 3')).toBeOnTheScreen();
    expect(screen.getAllByTestId('waggo-map-webview', { includeHiddenElements: true })).toHaveLength(1);
  }, 15000);
});
