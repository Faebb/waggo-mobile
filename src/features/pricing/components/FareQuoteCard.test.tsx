import { render, screen } from '@testing-library/react-native';

import type { FareQuote } from '../model/types';
import { FareQuoteCard } from './FareQuoteCard';

const quote: FareQuote = {
  walkType: 'Group',
  durationMinutes: 45,
  currency: 'COP',
  total: 11800,
  commission: 2360,
  walkerPayout: 9440,
};

describe('FareQuoteCard', () => {
  it('shows the total the owner will pay', async () => {
    await render(<FareQuoteCard quote={quote} />);

    expect(screen.getByLabelText('Total a pagar')).toHaveTextContent('$ 11.800');
  });

  it('shows how much goes to the walker', async () => {
    await render(<FareQuoteCard quote={quote} />);

    expect(screen.getByText('Paseo grupal · 45 min')).toBeOnTheScreen();
    expect(screen.getByLabelText('Para el paseador')).toHaveTextContent('$ 9.440');
  });
});
