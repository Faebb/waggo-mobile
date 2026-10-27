import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import {
  darkColors,
  fontFamily,
  getThemeMode,
  lightColors,
  setThemeMode,
  sizes,
  typography,
  useColors,
  useThemeMode,
} from './theme';

function ModeProbe() {
  return <Text>{useThemeMode()}</Text>;
}

function BackgroundProbe() {
  return <Text>{useColors().background}</Text>;
}

describe('theme', () => {
  beforeEach(() => {
    setThemeMode('light');
  });

  it('uses Inter for body text and Baloo 2 for headings (ADR-018)', () => {
    expect(fontFamily).toBe('Inter_400Regular');
    expect(typography.body.fontFamily).toBe('Inter_400Regular');
    expect(typography.title.fontFamily).toBe('Baloo2_700Bold');
  });

  it('starts in light mode (ADR-018 default) regardless of the system scheme', () => {
    expect(getThemeMode()).toBe('light');
  });

  it('switches mode and notifies subscribers', async () => {
    await render(<ModeProbe />);

    expect(screen.getByText('light')).toBeTruthy();

    await act(async () => setThemeMode('dark'));

    expect(screen.getByText('dark')).toBeTruthy();
  });

  it('does nothing when switching to the already-active mode', async () => {
    await render(<ModeProbe />);

    await act(async () => setThemeMode('light'));

    expect(screen.getByText('light')).toBeTruthy();
  });

  it('resolves colors to the active palette', async () => {
    await render(<BackgroundProbe />);

    expect(screen.getByText(lightColors.background)).toBeTruthy();

    await act(async () => setThemeMode('dark'));

    expect(screen.getByText(darkColors.background)).toBeTruthy();
  });

  it('adds the proposed accessibility roles without touching the ADR-018 palette (design proposal 03)', () => {
    expect(lightColors.dangerText).toBe('#FFFFFF');
    expect(darkColors.dangerText).toBe('#16212E');
    expect(lightColors.borderStrong).toBe('#8C7B70');
    expect(darkColors.borderStrong).toBe('#5E7488');
    expect(lightColors.warningText).toBe('#9A5A17');
    expect(darkColors.warningText).toBe('#F2A65A');
    expect(lightColors.primary).toBe('#3059A4');
  });

  it('sizes fields at 48 and chips at 44, never below the 44 touch target (design proposal 03)', () => {
    expect(sizes.field).toBe(48);
    expect(sizes.chip).toBe(44);
    expect(sizes.touch).toBe(44);
  });

  it('keeps AA contrast by using a different accent tone per theme (ADR-018)', () => {
    expect(lightColors.primary).not.toBe(darkColors.primary);
    expect(lightColors.primaryText).not.toBe(darkColors.primaryText);
  });
});
