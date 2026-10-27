import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { luna, max, requestedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { HomeScreen } from './HomeScreen';

type Props = Parameters<typeof HomeScreen>[0];

function renderHome(props: Partial<Props> = {}) {
  return renderWithProviders(
    <HomeScreen
      onRequestWalk={jest.fn()}
      onAddPet={jest.fn()}
      onOpenWalk={jest.fn()}
      onOpenNotifications={jest.fn()}
      {...props}
    />,
  );
}

describe('HomeScreen (RF-007)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('invites to request a walk, like asking for a ride', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [luna, max] },
    ]);
    const onRequestWalk = jest.fn();
    const user = userEvent.setup();
    await renderHome({ onRequestWalk });

    await user.press(screen.getByRole('button', { name: '¿Quién sale a pasear hoy?' }));

    expect(onRequestWalk).toHaveBeenCalledTimes(1);
  });

  it('shows the walk that is going on and opens it', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [requestedWalk] },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    const onOpenWalk = jest.fn();
    const user = userEvent.setup();
    await renderHome({ onOpenWalk });

    await user.press(await screen.findByRole('button', { name: /Buscando paseador/ }));

    expect(onOpenWalk).toHaveBeenCalledWith('walk-1');
  });

  it('puts a decorative mini map of the pickup on the walk card (design 07 · 7)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [requestedWalk] },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    await renderHome();

    await screen.findByRole('button', { name: /Buscando paseador/ });

    expect(screen.queryByLabelText('Mapa de la recogida')).not.toBeOnTheScreen();
    const frame = screen.getByTestId('waggo-map-webview', { includeHiddenElements: true });
    expect((frame.props.source as { html: string }).html).toContain('"interactive":false');
  });

  it('does not show finished or cancelled walks as going on', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [{ ...requestedWalk, status: 'Cancelled' }] },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderHome();

    await waitFor(() => expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(4));
    expect(screen.queryByRole('button', { name: /Ver paseo/ })).not.toBeOnTheScreen();
    expect(screen.queryByText('Cancelado')).not.toBeOnTheScreen();
  });

  it('greets the owner by first name', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [luna] },
      { path: '/api/v1/users/me', data: { id: 'u1', email: 'v@mail.com', fullName: 'Valentina Ruiz', phone: null } },
    ]);

    await renderHome();

    expect(await screen.findByRole('header', { name: 'Hola, Valentina' })).toBeOnTheScreen();
  });

  it('on first use, without dogs, asks to add one and explains how it works', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [] },
    ]);
    const onAddPet = jest.fn();
    const user = userEvent.setup();
    await renderHome({ onAddPet });

    expect(await screen.findByText('Primero, cuéntanos de tu perro')).toBeOnTheScreen();
    expect(screen.getByText('ASÍ FUNCIONA')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Agregar mi perro' }));

    expect(onAddPet).toHaveBeenCalledTimes(1);
  });

  it('lists the other walks still to come under Próximos', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/walks',
        data: [
          { ...requestedWalk, status: 'InProgress' },
          { ...requestedWalk, id: 'walk-2', petIds: ['pet-max'] },
        ],
      },
      { path: '/api/v1/pets', data: [luna, max] },
    ]);

    await renderHome();

    expect(await screen.findByText('PRÓXIMOS')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Ver paseo de Luna/ })).toBeOnTheScreen();
    expect(screen.getByText('Max')).toBeOnTheScreen();
  });

  it('opens the notices from the bell (RF-014)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [] },
      { path: '/api/v1/notifications', data: { unreadCount: 1, items: [] } },
    ]);
    const onOpenNotifications = jest.fn();
    const user = userEvent.setup();
    await renderHome({ onOpenNotifications });

    await user.press(await screen.findByRole('button', { name: 'Avisos, 1 sin leer' }));

    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('hides the admin link when onOpenAdmin is not given', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [] },
    ]);
    await renderHome();

    expect(await screen.findByText('¿Quién sale a pasear hoy?')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Panel de administración' })).not.toBeOnTheScreen();
  });

  it('opens the admin panel from its link (ADR-017)', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [] },
    ]);
    const onOpenAdmin = jest.fn();
    const user = userEvent.setup();
    await renderHome({ onOpenAdmin });

    await user.press(await screen.findByRole('button', { name: 'Panel de administración' }));

    expect(onOpenAdmin).toHaveBeenCalledTimes(1);
  });
});
