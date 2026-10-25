import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { EditProfileScreen } from './EditProfileScreen';

describe('EditProfileScreen (perfil de usuario)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('prefills the current name and phone', async () => {
    mockApi([
      {
        path: '/api/v1/users/me',
        method: 'GET',
        data: { id: 'u1', email: 'ana@mail.com', fullName: 'Ana Pérez', phone: '3001234567' },
      },
    ]);

    await renderWithProviders(<EditProfileScreen onSaved={jest.fn()} />);

    expect(await screen.findByDisplayValue('Ana Pérez')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('3001234567')).toBeOnTheScreen();
    expect(screen.getByText('ana@mail.com')).toBeOnTheScreen();
  });

  it('shows an error message when the profile fails to load', async () => {
    mockApi([{ path: '/api/v1/users/me', method: 'GET', status: 500 }]);

    await renderWithProviders(<EditProfileScreen onSaved={jest.fn()} />);

    expect(await screen.findByText('No pudimos cargar tu perfil. Intenta de nuevo.')).toBeOnTheScreen();
  });

  it('saves the new name and phone', async () => {
    const fetchSpy = mockApi([
      {
        path: '/api/v1/users/me',
        method: 'GET',
        data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null },
      },
      {
        path: '/api/v1/users/me',
        method: 'PUT',
        data: { id: 'u1', email: 'ana@mail.com', fullName: 'Ana Pérez', phone: '3001234567' },
      },
    ]);
    const onSaved = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<EditProfileScreen onSaved={onSaved} />);
    await screen.findByText('ana@mail.com');

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Celular'), '3001234567');
    await user.press(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    const putCall = fetchSpy.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(JSON.parse(String(putCall?.[1]?.body))).toEqual({ fullName: 'Ana Pérez', phone: '3001234567' });
  });

  it('shows an error message when saving fails', async () => {
    mockApi([
      {
        path: '/api/v1/users/me',
        method: 'GET',
        data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null },
      },
      {
        path: '/api/v1/users/me',
        method: 'PUT',
        status: 400,
        errors: [{ code: 'Identity.InvalidFullName', message: 'El nombre es muy largo.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<EditProfileScreen onSaved={jest.fn()} />);
    await screen.findByText('ana@mail.com');

    await user.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El nombre es muy largo.');
  });
});
