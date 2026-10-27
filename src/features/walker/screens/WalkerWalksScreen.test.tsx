import { screen, userEvent } from '@testing-library/react-native';

import { acceptedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkerWalksScreen } from './WalkerWalksScreen';

const finished = { ...acceptedWalk, id: 'walk-2', status: 'Completed', pickupAddress: 'Cl 85 # 12-30, Bogotá' };

describe('WalkerWalksScreen (RF-007, "Tus paseos" tab of design proposal 07 · 33)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('groups the accepted walks into coming and history, and opens one', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/assigned', data: [acceptedWalk, finished] }]);
    const onOpenWalk = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<WalkerWalksScreen onOpenWalk={onOpenWalk} />);

    expect(await screen.findByText('PRÓXIMOS')).toBeOnTheScreen();
    expect(screen.getByText('HISTORIAL')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /Cra 7 # 45-10, Bogotá/ }));

    expect(onOpenWalk).toHaveBeenCalledWith('walk-1');
  });

  it('says so when there are no walks yet', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/assigned', data: [] }]);

    await renderWithProviders(<WalkerWalksScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'Aún no tienes paseos' })).toBeOnTheScreen();
  });
});
