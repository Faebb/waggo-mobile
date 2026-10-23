import { screen, userEvent } from '@testing-library/react-native';

import { luna, max } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PetDetailScreen } from './PetDetailScreen';

jest.setTimeout(30_000);

describe('PetDetailScreen (RF-004)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows the name, breed, size, weight, birth date, age and medical notes of the dog', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets/pet-luna', data: { ...luna, birthDate: '2021-05-10' } }]);

    await renderWithProviders(<PetDetailScreen petId="pet-luna" onBack={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'Luna' })).toBeOnTheScreen();
    expect(screen.getByText('Criolla')).toBeOnTheScreen();
    expect(screen.getByText('Mediano')).toBeOnTheScreen();
    expect(screen.getByText('14,5 kg')).toBeOnTheScreen();
    expect(screen.getByText('10 de mayo de 2021')).toBeOnTheScreen();
    expect(screen.getByText(/años|meses|mes/)).toBeOnTheScreen();
    expect(screen.getByText('Alérgica al pollo')).toBeOnTheScreen();
  });

  it('says "Sin dato" for the optional data the dog does not have', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets/pet-max', data: max }]);

    await renderWithProviders(<PetDetailScreen petId="pet-max" onBack={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'Max' })).toBeOnTheScreen();
    expect(screen.getByText('Pequeño')).toBeOnTheScreen();
    expect(screen.getAllByText('Sin dato')).toHaveLength(5);
  });

  it('explains that the dog was not found and goes back with "Volver" (404)', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/pets/otro',
        status: 404,
        errors: [{ code: 'Pets.NotFound', message: 'No encontramos ese perro entre los tuyos.' }],
      },
    ]);
    const onBack = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(<PetDetailScreen petId="otro" onBack={onBack} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No encontramos a este perro entre los tuyos.');
    await user.press(screen.getByRole('button', { name: 'Volver' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows a friendly error when the dog cannot be loaded', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/pets/pet-luna', status: 500, errors: [{ code: 'Server.Unexpected', message: 'Boom' }] },
    ]);

    await renderWithProviders(<PetDetailScreen petId="pet-luna" onBack={jest.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar a este perro. Intenta de nuevo.');
  });
});
