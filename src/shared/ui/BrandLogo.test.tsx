import { act, render, screen } from '@testing-library/react-native';

import { BrandLogo } from './BrandLogo';
import { setThemeMode } from './theme';

describe('BrandLogo (provisional, design proposal 08)', () => {
  beforeEach(() => setThemeMode('light'));

  it('is a single image labeled "Waggo"', async () => {
    await render(<BrandLogo variant="full" size={150} />);

    expect(screen.getByRole('image', { name: 'Waggo' })).toBeOnTheScreen();
  });

  it('sits on the cream medal in the dark theme', async () => {
    await render(<BrandLogo variant="head" size={44} />);
    expect(screen.queryByTestId('brand-medal')).toBeNull();

    await act(async () => setThemeMode('dark'));

    expect(screen.getByTestId('brand-medal')).toBeOnTheScreen();
    await act(async () => setThemeMode('light'));
  });
});
