import { screen, userEvent } from '@testing-library/react-native';

import { luna } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PetDetailScreen } from './PetDetailScreen';

describe('PetDetailScreen (RF-004, design proposal 07 · 10)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows the dog with its private medical notes', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets/pet-luna', data: luna }]);

    await renderWithProviders(<PetDetailScreen petId="pet-luna" onRequestWalk={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'Luna' })).toBeOnTheScreen();
    expect(screen.getByText('Criolla')).toBeOnTheScreen();
    expect(screen.getByText('14,5 kg')).toBeOnTheScreen();
    expect(screen.getByText('Alérgica al pollo')).toBeOnTheScreen();
    expect(screen.getByText('Se guardan cifradas. Hoy solo tú las ves.')).toBeOnTheScreen();
  });

  it('shows the birth date as day/month/year', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets/pet-luna', data: { ...luna, birthDate: '2021-05-10' } }]);

    await renderWithProviders(<PetDetailScreen petId="pet-luna" onRequestWalk={jest.fn()} />);

    expect(await screen.findByText('10/05/2021')).toBeOnTheScreen();
  });

  it('asks for a walk with this dog', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets/pet-luna', data: luna }]);
    const onRequestWalk = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<PetDetailScreen petId="pet-luna" onRequestWalk={onRequestWalk} />);

    await user.press(await screen.findByRole('button', { name: 'Pedir paseo con Luna' }));

    expect(onRequestWalk).toHaveBeenCalledWith('pet-luna');
  });

  it('offers to retry when the dog does not load', async () => {
    fetchSpy = mockApi([]);

    await renderWithProviders(<PetDetailScreen petId="pet-luna" onRequestWalk={jest.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar a tu perro.');
  });
});
