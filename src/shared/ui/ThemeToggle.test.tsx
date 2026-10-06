import { render, screen, userEvent } from '@testing-library/react-native';

import { getThemeMode, setThemeMode } from './theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    setThemeMode('dark');
  });

  it('marks the active mode as selected', async () => {
    await render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Oscuro' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Claro' })).not.toBeSelected();
  });

  it('switches to light mode when "Claro" is pressed', async () => {
    const user = userEvent.setup();
    await render(<ThemeToggle />);

    await user.press(screen.getByRole('button', { name: 'Claro' }));

    expect(getThemeMode()).toBe('light');
  });

  it('switches back to dark mode when "Oscuro" is pressed', async () => {
    setThemeMode('light');
    const user = userEvent.setup();
    await render(<ThemeToggle />);

    await user.press(screen.getByRole('button', { name: 'Oscuro' }));

    expect(getThemeMode()).toBe('dark');
  });
});
