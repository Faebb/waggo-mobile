import { screen, userEvent } from '@testing-library/react-native';

import { luna, max, requestedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { MyWalksScreen } from './MyWalksScreen';

const cancelledWalk = { ...requestedWalk, id: 'walk-2', status: 'Cancelled', petIds: ['pet-luna', 'pet-max'] };

describe('MyWalksScreen (RF-007)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('lists the walks with their dogs and status', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [requestedWalk, cancelledWalk] },
      { path: '/api/v1/pets', data: [luna, max] },
    ]);

    await renderWithProviders(<MyWalksScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByText('Buscando paseador')).toBeOnTheScreen();
    expect(screen.getByText('Cancelado')).toBeOnTheScreen();
    expect(await screen.findByText('Luna y Max')).toBeOnTheScreen();
  });

  it('opens a walk', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [requestedWalk] },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    const onOpenWalk = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MyWalksScreen onOpenWalk={onOpenWalk} />);

    await user.press(await screen.findByRole('button', { name: /Buscando paseador/ }));

    expect(onOpenWalk).toHaveBeenCalledWith('walk-1');
  });

  it('says so when there are no walks yet', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [] },
    ]);

    await renderWithProviders(<MyWalksScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByText('Aún no has pedido paseos.')).toBeOnTheScreen();
  });
});
