import { screen } from '@testing-library/react-native';

import { capturedPayment, heldPayment } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PaymentSummary } from './PaymentSummary';

describe('PaymentSummary (RF-016)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('tells the owner the money is held until the end', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/payment', data: heldPayment }]);

    await renderWithProviders(<PaymentSummary walkId="walk-1" walkStatus="Accepted" viewer="Owner" />);

    expect(await screen.findByText('Retenido: se cobra al terminar')).toBeOnTheScreen();
  });

  it('tells the walker they were paid', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/payment', data: capturedPayment }]);

    await renderWithProviders(<PaymentSummary walkId="walk-1" walkStatus="Completed" viewer="Walker" />);

    expect(await screen.findByText('Pagado a tu cuenta')).toBeOnTheScreen();
  });

  it('shows nothing for a walk without payment', async () => {
    fetchSpy = mockApi([]);

    await renderWithProviders(<PaymentSummary walkId="walk-1" walkStatus="Accepted" viewer="Owner" />);

    await screen.findByTestId('payment-empty');
    expect(screen.queryByText(/Retenido|Pagado/)).toBeNull();
  });
});
