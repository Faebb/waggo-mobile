import { act, render, screen } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';

import { darkColors, fontFamily, getThemeMode, lightColors, setThemeMode, useColors, useThemeMode } from './theme';

function ModeProbe() {
  return <Text>{useThemeMode()}</Text>;
}

function BackgroundProbe() {
  return <Text>{useColors().background}</Text>;
}

describe('theme', () => {
  beforeEach(() => {
    setThemeMode('dark');
  });

  it('uses Helvetica as the typeface', () => {
    const expected = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica' });

    expect(fontFamily).toBe(expected);
    expect(fontFamily).toMatch(/Helvetica|sans-serif/);
  });

  it('starts in dark mode (ADR-013 default) regardless of the system scheme', () => {
    expect(getThemeMode()).toBe('dark');
  });

  it('switches mode and notifies subscribers', async () => {
    await render(<ModeProbe />);

    expect(screen.getByText('dark')).toBeTruthy();

    await act(async () => setThemeMode('light'));

    expect(screen.getByText('light')).toBeTruthy();
  });

  it('does nothing when switching to the already-active mode', async () => {
    await render(<ModeProbe />);

    await act(async () => setThemeMode('dark'));

    expect(screen.getByText('dark')).toBeTruthy();
  });

  it('resolves colors to the active palette', async () => {
    await render(<BackgroundProbe />);

    expect(screen.getByText(darkColors.background)).toBeTruthy();

    await act(async () => setThemeMode('light'));

    expect(screen.getByText(lightColors.background)).toBeTruthy();
  });

  it('keeps the yellow accent identical across palettes (ADR-013: único acento)', () => {
    expect(lightColors.primary).toBe(darkColors.primary);
    expect(lightColors.primaryText).toBe(darkColors.primaryText);
  });
});
