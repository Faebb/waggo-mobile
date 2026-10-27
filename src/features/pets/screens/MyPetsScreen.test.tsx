import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { MyPetsScreen } from './MyPetsScreen';

const luna = {
  id: 'a1',
  name: 'Luna',
  breed: 'Criolla',
  size: 'Medium',
  birthDate: '2021-05-10',
  weightKg: 14.5,
  medicalNotes: 'Alérgica al pollo',
};
const max = { ...luna, id: 'a2', name: 'Max', breed: null, size: 'Small', weightKg: null, medicalNotes: null };

function respondWith(data: unknown, status = 200, errors: unknown[] = []) {
  return new Response(
    JSON.stringify({
      success: errors.length === 0,
      data,
      pagination: null,
      errors,
      warnings: [],
      infos: [],
      traceId: 't',
    }),
    { status },
  );
}

describe('MyPetsScreen (RF-004)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => fetchSpy.mockRestore());

  it('lists the owner dogs with their size, breed and weight', async () => {
    fetchSpy.mockResolvedValue(respondWith([luna, max]));

    await renderWithProviders(<MyPetsScreen onAddPress={jest.fn()} onOpenPet={jest.fn()} />);

    expect(await screen.findByText('Luna')).toBeOnTheScreen();
    expect(screen.getByText('Mediano · Criolla · 14,5 kg')).toBeOnTheScreen();
    expect(screen.getByText('Max')).toBeOnTheScreen();
    expect(screen.getByText('Pequeño')).toBeOnTheScreen();
    expect(screen.getAllByText('Notas médicas privadas')).toHaveLength(1);
  });

  it('counts the dogs against the maximum per owner ("2 de 10 perros")', async () => {
    fetchSpy.mockResolvedValue(respondWith([luna, max]));

    await renderWithProviders(<MyPetsScreen onAddPress={jest.fn()} onOpenPet={jest.fn()} />);

    expect(await screen.findByText('2 de 10 perros')).toBeOnTheScreen();
  });

  it('opens the detail of a dog', async () => {
    fetchSpy.mockResolvedValue(respondWith([luna, max]));
    const onOpenPet = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MyPetsScreen onAddPress={jest.fn()} onOpenPet={onOpenPet} />);

    await user.press(await screen.findByRole('button', { name: /Luna/ }));

    expect(onOpenPet).toHaveBeenCalledWith('a1');
  });

  it('invites to add the first dog when there are none', async () => {
    fetchSpy.mockResolvedValue(respondWith([]));

    await renderWithProviders(<MyPetsScreen onAddPress={jest.fn()} onOpenPet={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'Aún no tienes perros' })).toBeOnTheScreen();
  });

  it('opens the form when the owner taps "Agregar perro"', async () => {
    fetchSpy.mockResolvedValue(respondWith([]));
    const onAddPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MyPetsScreen onAddPress={onAddPress} onOpenPet={jest.fn()} />);
    await screen.findByText('Aún no tienes perros');

    await user.press(screen.getByRole('button', { name: 'Agregar mi primer perro' }));

    expect(onAddPress).toHaveBeenCalledTimes(1);
  });

  it('shows a friendly error when the dogs cannot be loaded', async () => {
    fetchSpy.mockResolvedValue(respondWith(null, 500, [{ code: 'Server.Unexpected', message: 'Boom' }]));

    await renderWithProviders(<MyPetsScreen onAddPress={jest.fn()} onOpenPet={jest.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus perros.');
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeOnTheScreen();
  });
});
