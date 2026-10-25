import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { ProfileMenuScreen } from './ProfileMenuScreen';

function renderMenu(props: Partial<Parameters<typeof ProfileMenuScreen>[0]> = {}) {
  return renderWithProviders(
    <ProfileMenuScreen
      onOpenPersonalInfo={jest.fn()}
      onOpenPets={jest.fn()}
      onOpenWalks={jest.fn()}
      onOpenNotifications={jest.fn()}
      onLoggedOut={jest.fn()}
      {...props}
    />,
  );
}

describe('ProfileMenuScreen (perfil de usuario)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows the name, the email and an avatar with the first letter', async () => {
    mockApi([
      { path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: 'Ana Pérez', phone: null } },
    ]);

    await renderMenu();

    expect(await screen.findByText('Ana Pérez')).toBeOnTheScreen();
    expect(screen.getByText('ana@mail.com')).toBeOnTheScreen();
    expect(screen.getByText('A')).toBeOnTheScreen();
  });

  it('shows an error message when the profile fails to load', async () => {
    mockApi([{ path: '/api/v1/users/me', status: 500 }]);

    await renderMenu();

    expect(await screen.findByText('No pudimos cargar tu perfil. Intenta de nuevo.')).toBeOnTheScreen();
  });

  it('falls back to the email when there is no name yet', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);

    await renderMenu();

    expect(await screen.findByText('Agrega tu nombre')).toBeOnTheScreen();
  });

  it('opens personal info, pets, walks and notifications', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onOpenPersonalInfo = jest.fn();
    const onOpenPets = jest.fn();
    const onOpenWalks = jest.fn();
    const onOpenNotifications = jest.fn();
    const user = userEvent.setup();
    await renderMenu({ onOpenPersonalInfo, onOpenPets, onOpenWalks, onOpenNotifications });

    await user.press(await screen.findByRole('button', { name: /Información personal/ }));
    await user.press(screen.getByRole('button', { name: /Mis perros/ }));
    await user.press(screen.getByRole('button', { name: /Mis paseos/ }));
    await user.press(screen.getByRole('button', { name: /Notificaciones/ }));

    expect(onOpenPersonalInfo).toHaveBeenCalledTimes(1);
    expect(onOpenPets).toHaveBeenCalledTimes(1);
    expect(onOpenWalks).toHaveBeenCalledTimes(1);
    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('logs out', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onLoggedOut = jest.fn();
    const user = userEvent.setup();
    await renderMenu({ onLoggedOut });

    await user.press(await screen.findByRole('button', { name: /Cerrar sesión/ }));

    await waitFor(() => expect(onLoggedOut).toHaveBeenCalledTimes(1));
  });
});
