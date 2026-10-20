import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

/** Dark theme with yellow as the only accent (vault › ADR-013). The shipped default. */
export const darkColors = {
  primary: '#FFC527',
  primaryText: '#14120A',
  text: '#F4F1E8',
  muted: '#9A968A',
  surface: '#1A1A17',
  surface2: '#25221D',
  background: '#0F0F0D',
  border: '#2C2B26',
  danger: '#FF6B5E',
  success: '#4CC38A',
} as const;

/** Light theme, same accent and structure as dark (vault › ADR-015). */
export const lightColors = {
  primary: '#FFC527',
  primaryText: '#14120A',
  text: '#17140F',
  muted: '#5F584A',
  surface: '#FFFFFF',
  surface2: '#F3EEE1',
  background: '#FAF7EF',
  border: '#E7E0CE',
  danger: '#C23B3B',
  success: '#1F7A52',
} as const;

export type Colors = Record<keyof typeof darkColors, string>;
export type ThemeMode = 'light' | 'dark';

const palettes: Record<ThemeMode, Colors> = { dark: darkColors, light: lightColors };

export const THEME_MODE_STORAGE_KEY = 'waggo:theme-mode';

/** ADR-013: the app ships dark by default; the user opts into light from `ThemeToggle`. */
let mode: ThemeMode = 'dark';
const listeners = new Set<() => void>();

export function getThemeMode(): ThemeMode {
  return mode;
}

export function setThemeMode(next: ThemeMode) {
  if (next === mode) return;
  mode = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useThemeMode(): ThemeMode {
  const [current, setCurrent] = useState(getThemeMode);

  useEffect(() => subscribe(() => setCurrent(getThemeMode())), []);

  return current;
}

export function useColors(): Colors {
  return palettes[useThemeMode()];
}

/**
 * Builds a `StyleSheet` from the active palette, recomputed only when the theme mode changes.
 * `typography`/`spacing`/`radius`/`layout` don't vary by theme (vault › Sistema de diseño), so screens keep
 * importing those directly.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>>(
  factory: (colors: Colors) => T,
): T {
  const colors = useColors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}

/** Helvetica where the OS ships it; Android has no Helvetica, so it falls back to its system sans. */
export const fontFamily = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica' });

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 12, pill: 999 } as const;

/** Mobile first (ADR-013): on tablets and web every screen keeps a phone-width column. */
export const layout = {
  column: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
} as const;

export const typography = {
  display: { fontFamily, fontSize: 44, lineHeight: 46, fontWeight: '700', letterSpacing: -1.5 },
  title: { fontFamily, fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontFamily, fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontFamily, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { fontFamily, fontSize: 13, lineHeight: 17, fontWeight: '400' },
  eyebrow: { fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.5 },
} as const;
