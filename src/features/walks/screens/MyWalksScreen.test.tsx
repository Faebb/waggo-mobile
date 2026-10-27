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

    await renderWithProviders(<MyWalksScreen onOpenWalk={jest.fn()} onRequestWalk={jest.fn()} />);

    expect(await screen.findByText('Buscando paseador')).toBeOnTheScreen();
    expect(screen.getByText('Cancelado')).toBeOnTheScreen();
    expect(await screen.findByText('Luna y Max')).toBeOnTheScreen();
    expect(screen.getByText('PROGRAMADOS')).toBeOnTheScreen();
    expect(screen.getByText('HISTORIAL')).toBeOnTheScreen();
  });

  it('opens a walk', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [requestedWalk] },
      { path: '/api/v1/pets', data: [luna] },
    ]);
    const onOpenWalk = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MyWalksScreen onOpenWalk={onOpenWalk} onRequestWalk={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: /Buscando paseador/ }));

    expect(onOpenWalk).toHaveBeenCalledWith('walk-1');
  });

  it('says so when there are no walks yet and offers to ask for one', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [] },
      { path: '/api/v1/pets', data: [] },
    ]);
    const onRequestWalk = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(<MyWalksScreen onOpenWalk={jest.fn()} onRequestWalk={onRequestWalk} />);

    expect(await screen.findByRole('header', { name: 'Aún no has pedido paseos' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Pedir un paseo' }));
    expect(onRequestWalk).toHaveBeenCalledTimes(1);
  });

  it('shows the walk in progress apart, on top', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks', data: [{ ...requestedWalk, status: 'InProgress' }] },
      { path: '/api/v1/pets', data: [luna] },
    ]);

    await renderWithProviders(<MyWalksScreen onOpenWalk={jest.fn()} onRequestWalk={jest.fn()} />);

    expect(await screen.findByText('EN CURSO')).toBeOnTheScreen();
  });

  it('offers to retry when the walks do not load', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/pets', data: [] }]);

    await renderWithProviders(<MyWalksScreen onOpenWalk={jest.fn()} onRequestWalk={jest.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus paseos.');
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeOnTheScreen();
  });
});
