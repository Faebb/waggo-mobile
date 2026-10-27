import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { PlaceSearch } from './PlaceSearch';

const found = {
  place_id: 9,
  lat: '4.6361',
  lon: '-74.0645',
  display_name: 'Carrera 7, Chapinero, Bogotá',
  address: { road: 'Carrera 7', house_number: '45-10', suburb: 'Chapinero', city: 'Bogotá' },
};

function fakeNominatim(body: unknown, status = 200) {
  return jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(body), { status }));
}

describe('PlaceSearch (Nominatim, no autocomplete)', () => {
  let fetchSpy: jest.SpyInstance;
  afterEach(() => fetchSpy?.mockRestore());

  it('searches only when the user presses "Buscar" and lets them pick a result', async () => {
    fetchSpy = fakeNominatim([found]);
    const onSelect = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<PlaceSearch onSelect={onSelect} />);

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrera 7 45-10 Bogotá');
    expect(fetchSpy).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Buscar' }));
    const result = await screen.findByRole('button', { name: 'Carrera 7 # 45-10, Chapinero · Bogotá' });
    expect(screen.getByText('Búsqueda: © OpenStreetMap contributors (Nominatim)')).toBeOnTheScreen();
    await user.press(result);

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ title: 'Carrera 7 # 45-10', latitude: 4.6361 }));
    expect(screen.queryByText('Carrera 7 # 45-10')).not.toBeOnTheScreen();
  });

  it('says when nothing was found', async () => {
    fetchSpy = fakeNominatim([]);
    const user = userEvent.setup();
    await renderWithProviders(<PlaceSearch onSelect={jest.fn()} />);

    await user.type(screen.getByLabelText('Buscar dirección'), 'Calle inventada 999');
    await user.press(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('No encontramos esa dirección. Prueba con calle y número.')).toBeOnTheScreen();
  });

  it('says when the search failed', async () => {
    fetchSpy = fakeNominatim({}, 503);
    const user = userEvent.setup();
    await renderWithProviders(<PlaceSearch onSelect={jest.fn()} />);

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrera 9 Valledupar');
    await user.press(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByText('No pudimos buscar la dirección. Revisa tu conexión o escríbela abajo.'),
    ).toBeOnTheScreen();
  });

  it('asks for a few more letters before searching', async () => {
    fetchSpy = fakeNominatim([]);
    const user = userEvent.setup();
    await renderWithProviders(<PlaceSearch onSelect={jest.fn()} />);

    await user.type(screen.getByLabelText('Buscar dirección'), 'Cr');
    await user.press(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByText('Escribe al menos 3 letras.')).toBeOnTheScreen();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
