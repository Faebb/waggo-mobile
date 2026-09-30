import { screen, userEvent } from '@testing-library/react-native';

import { luna, max, requestedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { HomeScreen } from './HomeScreen';

type Props = Parameters<typeof HomeScreen>[0];

function renderHome(props: Partial<Props> = {}) {
  return renderWithProviders(
    <HomeScreen
      onRequestWalk={jest.fn()}
      onOpenPets={jest.fn()}
      onOpenWalks={jest.fn()}
      onOpenWalk={jest.fn()}
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

  it('does not show finished or cancelled walks as going on', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [{ ...requestedWalk, status: 'Cancelled' }] },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderHome();

    expect(await screen.findByRole('button', { name: /Mis paseos/ })).toBeOnTheScreen();
    expect(screen.queryByText('Cancelado')).not.toBeOnTheScreen();
  });

  it('opens my dogs and my walks', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [luna, max] },
    ]);
    const onOpenPets = jest.fn();
    const onOpenWalks = jest.fn();
    const user = userEvent.setup();
    await renderHome({ onOpenPets, onOpenWalks });

    await user.press(await screen.findByRole('button', { name: /Mis perros/ }));
    await user.press(screen.getByRole('button', { name: /Mis paseos/ }));

    expect(onOpenPets).toHaveBeenCalledTimes(1);
    expect(onOpenWalks).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('2 perros')).toBeOnTheScreen();
  });
});
