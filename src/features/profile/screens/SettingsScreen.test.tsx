import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { SettingsScreen } from './SettingsScreen';

function renderSettings(props: Partial<Parameters<typeof SettingsScreen>[0]> = {}) {
  return renderWithProviders(
    <SettingsScreen
      onOpenPersonalInfo={jest.fn()}
      onOpenPets={jest.fn()}
      onOpenWalks={jest.fn()}
      onOpenNotifications={jest.fn()}
      onOpenChangePassword={jest.fn()}
      onOpenChangeEmail={jest.fn()}
      onLoggedOut={jest.fn()}
      {...props}
    />,
  );
}

describe('SettingsScreen (configuración)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows the name, the email and an avatar with the first letter', async () => {
    mockApi([
      { path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: 'Ana Pérez', phone: null } },
    ]);

    await renderSettings();

    expect(await screen.findByText('Ana Pérez')).toBeOnTheScreen();
    expect(screen.getByText('ana@mail.com')).toBeOnTheScreen();
    expect(screen.getByText('A')).toBeOnTheScreen();
  });

  it('shows an error message when the profile fails to load', async () => {
    mockApi([{ path: '/api/v1/users/me', status: 500 }]);

    await renderSettings();

    expect(await screen.findByText('No pudimos cargar tu perfil. Intenta de nuevo.')).toBeOnTheScreen();
  });

  it('falls back to the email when there is no name yet', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);

    await renderSettings();

    expect(await screen.findByText('Agrega tu nombre')).toBeOnTheScreen();
  });

  it('opens personal info, pets, walks and notifications', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onOpenPersonalInfo = jest.fn();
    const onOpenPets = jest.fn();
    const onOpenWalks = jest.fn();
    const onOpenNotifications = jest.fn();
    const user = userEvent.setup();
    await renderSettings({ onOpenPersonalInfo, onOpenPets, onOpenWalks, onOpenNotifications });

    await user.press(await screen.findByRole('button', { name: /Información personal/ }));
    await user.press(screen.getByRole('button', { name: /Mis perros/ }));
    await user.press(screen.getByRole('button', { name: /Mis paseos/ }));
    await user.press(screen.getByRole('button', { name: /Notificaciones/ }));

    expect(onOpenPersonalInfo).toHaveBeenCalledTimes(1);
    expect(onOpenPets).toHaveBeenCalledTimes(1);
    expect(onOpenWalks).toHaveBeenCalledTimes(1);
    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('hides "Mis perros" for roles without dogs (e.g. the walker)', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);

    await renderSettings({ onOpenPets: undefined });

    await screen.findByText('ana@mail.com');
    expect(screen.queryByRole('button', { name: /Mis perros/ })).toBeNull();
  });

  it('includes the theme switch', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);

    await renderSettings();
    await screen.findByText('ana@mail.com');

    expect(screen.getByText('Tema')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Claro' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Oscuro' })).toBeOnTheScreen();
  });

  it('logs out', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onLoggedOut = jest.fn();
    const user = userEvent.setup();
    await renderSettings({ onLoggedOut });

    await user.press(await screen.findByRole('button', { name: /Cerrar sesión/ }));

    await waitFor(() => expect(onLoggedOut).toHaveBeenCalledTimes(1));
  });

  it('opens the change password screen', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onOpenChangePassword = jest.fn();
    const user = userEvent.setup();
    await renderSettings({ onOpenChangePassword });

    await user.press(await screen.findByRole('button', { name: /Cambiar contraseña/ }));

    expect(onOpenChangePassword).toHaveBeenCalledTimes(1);
  });

  it('opens the change email screen', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onOpenChangeEmail = jest.fn();
    const user = userEvent.setup();
    await renderSettings({ onOpenChangeEmail });

    await user.press(await screen.findByRole('button', { name: /Cambiar correo/ }));

    expect(onOpenChangeEmail).toHaveBeenCalledTimes(1);
  });
});
