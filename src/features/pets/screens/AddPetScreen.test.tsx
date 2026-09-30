import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { AddPetScreen } from './AddPetScreen';

const saved = {
  id: 'a1',
  name: 'Luna',
  breed: 'Criolla',
  size: 'Large',
  birthDate: null,
  weightKg: 30.5,
  medicalNotes: 'Alérgica al pollo',
};

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

describe('AddPetScreen (RF-004)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(saved));
  });

  afterEach(() => fetchSpy.mockRestore());

  it('registers the dog with the form data and reports the saved pet', async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<AddPetScreen onSaved={onSaved} />);

    await user.type(screen.getByLabelText('Nombre'), 'Luna');
    await user.type(screen.getByLabelText('Raza'), 'Criolla');
    await user.press(screen.getByRole('button', { name: 'Grande' }));
    await user.type(screen.getByLabelText('Peso (kg)'), '30,5');
    await user.type(screen.getByLabelText('Notas médicas'), 'Alérgica al pollo');
    await user.press(screen.getByRole('button', { name: 'Guardar perro' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/pets$/);
    expect(JSON.parse(String(init.body))).toEqual({
      name: 'Luna',
      breed: 'Criolla',
      size: 'Large',
      weightKg: 30.5,
      medicalNotes: 'Alérgica al pollo',
    });
    expect(onSaved).toHaveBeenCalledWith(saved);
  });

  it('asks for the name without calling the API', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<AddPetScreen onSaved={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Guardar perro' }));

    expect(screen.getByText('Escribe el nombre de tu perro.')).toBeOnTheScreen();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('asks for a valid weight without calling the API', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<AddPetScreen onSaved={jest.fn()} />);

    await user.type(screen.getByLabelText('Nombre'), 'Luna');
    await user.type(screen.getByLabelText('Peso (kg)'), 'mucho');
    await user.press(screen.getByRole('button', { name: 'Guardar perro' }));

    expect(screen.getByText('Escribe el peso en kilos, por ejemplo 12,5.')).toBeOnTheScreen();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the messages of the API when it rejects the dog', async () => {
    fetchSpy.mockResolvedValue(
      respondWith(null, 422, [
        { code: 'Pets.LimitReached', message: 'Ya registraste 10 perros, el máximo por cuenta.' },
      ]),
    );
    const onSaved = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<AddPetScreen onSaved={onSaved} />);

    await user.type(screen.getByLabelText('Nombre'), 'Once');
    await user.press(screen.getByRole('button', { name: 'Guardar perro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya registraste 10 perros, el máximo por cuenta.');
    expect(onSaved).not.toHaveBeenCalled();
  });
});
