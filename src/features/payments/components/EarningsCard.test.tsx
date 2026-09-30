import { screen } from '@testing-library/react-native';

import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { EarningsCard } from './EarningsCard';

describe('EarningsCard (RF-017)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows what the walker earned and for how many walks', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/payments/earnings',
        data: {
          currency: 'COP',
          total: 36800,
          walks: [
            { walkId: 'walk-1', walkerPayout: 18400, capturedAt: '2026-09-30T16:05:00+00:00' },
            { walkId: 'walk-2', walkerPayout: 18400, capturedAt: '2026-09-30T14:05:00+00:00' },
          ],
        },
      },
    ]);

    await renderWithProviders(<EarningsCard />);

    expect(await screen.findByText('$ 36.800')).toBeOnTheScreen();
    expect(screen.getByText('2 paseos pagados')).toBeOnTheScreen();
  });

  it('invites to take the first walk when there are no earnings', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/payments/earnings', data: { currency: null, total: 0, walks: [] } }]);

    await renderWithProviders(<EarningsCard />);

    expect(await screen.findByText('Acepta una solicitud y cobra al terminar el paseo.')).toBeOnTheScreen();
  });
});
