import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { pendingWalkerProfile } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { BecomeWalkerScreen } from './BecomeWalkerScreen';

describe('BecomeWalkerScreen (RF-002)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('sends the profile for verification', async () => {
    fetchSpy = mockApi([{ method: 'POST', path: '/api/v1/walkers/me', data: pendingWalkerProfile }]);
    const onRegistered = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<BecomeWalkerScreen onRegistered={onRegistered} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Andrés Gómez');
    await user.press(screen.getByRole('button', { name: 'Pasaporte' }));
    await user.type(screen.getByLabelText('Número de documento'), 'AB123456');
    await user.type(screen.getByLabelText('Celular'), '3001234567');
    await user.type(screen.getByLabelText('Experiencia con perros'), '3 años');
    await user.press(screen.getByRole('button', { name: 'Enviar para verificación' }));

    await waitFor(() => expect(onRegistered).toHaveBeenCalledWith(pendingWalkerProfile));
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      fullName: 'Andrés Gómez',
      documentType: 'PP',
      documentNumber: 'AB123456',
      phone: '3001234567',
      experience: '3 años',
    });
  });

  it('shows what is missing without calling the API', async () => {
    fetchSpy = mockApi([]);
    const user = userEvent.setup();
    await renderWithProviders(<BecomeWalkerScreen onRegistered={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Enviar para verificación' }));

    expect(screen.getByText('Escribe tu nombre completo.')).toBeOnTheScreen();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the API messages as they come', async () => {
    fetchSpy = mockApi([
      {
        method: 'POST',
        path: '/api/v1/walkers/me',
        status: 400,
        errors: [{ code: 'Walkers.InvalidDocument', message: 'El número de documento no es válido.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<BecomeWalkerScreen onRegistered={jest.fn()} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Andrés Gómez');
    await user.type(screen.getByLabelText('Número de documento'), '1234');
    await user.type(screen.getByLabelText('Celular'), '3001234567');
    await user.press(screen.getByRole('button', { name: 'Enviar para verificación' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El número de documento no es válido.');
  });
});
