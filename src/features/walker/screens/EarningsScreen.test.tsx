import { screen } from '@testing-library/react-native';

import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { EarningsScreen } from './EarningsScreen';

describe('EarningsScreen (RF-017, "Ganancias" tab of design proposal 07 · 32)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows the total, the number of walks and each paid walk', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/payments/earnings',
        data: {
          currency: 'COP',
          total: 36800,
          walks: [
            { walkId: 'walk-1', walkerPayout: 18400, capturedAt: '2026-09-30T16:05:00+00:00' },
            { walkId: 'walk-2', walkerPayout: 18400, capturedAt: '2026-09-29T16:05:00+00:00' },
          ],
        },
      },
    ]);

    await renderWithProviders(<EarningsScreen />);

    expect(await screen.findByText('$ 36.800')).toBeOnTheScreen();
    expect(screen.getByText('2 paseos pagados')).toBeOnTheScreen();
    expect(screen.getAllByText('Pagado')).toHaveLength(2);
  });

  it('says so when there are no earnings yet', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/payments/earnings', data: { currency: null, total: 0, walks: [] } }]);

    await renderWithProviders(<EarningsScreen />);

    expect(await screen.findByRole('header', { name: 'Aún no tienes ganancias' })).toBeOnTheScreen();
  });

  it('offers to retry when the earnings do not load', async () => {
    fetchSpy = mockApi([]);

    await renderWithProviders(<EarningsScreen />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus ganancias.');
  });
});
