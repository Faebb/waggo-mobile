import { render, screen } from '@testing-library/react-native';

import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('shows the status word, never only a color', async () => {
    await render(<StatusPill label="En curso" tone="success" />);

    expect(screen.getByText('En curso')).toBeOnTheScreen();
  });
});
