import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

/**
 * Light palette, "Seashell & Sapphire" (vault › ADR-018). The shipped default: warm cream background, sapphire
 * blue accent. Unlike the retired ADR-013 palette, the accent tone differs between light and dark to keep AA
 * contrast on each background.
 */
export const lightColors = {
  primary: '#3059A4',
  primaryText: '#FFFFFF',
  secondary: '#006E87',
  info: '#2E9EC4',
  warning: '#C97A2B',
  text: '#16212E',
  muted: '#3A4A5C',
  surface: '#FFFFFF',
  surface2: '#FBE2D3',
  background: '#FFF0E9',
  border: '#E8D2C3',
  danger: '#C23B3B',
  success: '#1F7A52',
  // Proposed roles (design proposal 03, approved by the PO for implementation): they add contrast roles on top of
  // the ADR-018 palette without changing any of its colors.
  /** Label on a `danger` fill (emergency button): 5.3:1. */
  dangerText: '#FFFFFF',
  /** Outline of fields and chips, ≥ 3:1 against the background (WCAG 1.4.11); `border` stays for separators. */
  borderStrong: '#8C7B70',
  /** Readable warning text on light backgrounds (4.9:1); `warning` stays for fills and icons. */
  warningText: '#9A5A17',
  /** Backdrop behind sheets and dialogs. */
  scrim: '#16212E66',
} as const;

/** Dark palette, same roles as light (vault › ADR-018). */
export const darkColors = {
  primary: '#5B9BD5',
  primaryText: '#16212E',
  secondary: '#3FA3BD',
  info: '#7FD4EC',
  warning: '#F2A65A',
  text: '#FFF0E9',
  muted: '#8FA5B8',
  surface: '#1C2733',
  surface2: '#22303E',
  background: '#16212E',
  border: '#2A3B4D',
  danger: '#FF7A7A',
  success: '#4CC38A',
  dangerText: '#16212E',
  borderStrong: '#5E7488',
  warningText: '#F2A65A',
  scrim: '#0B111899',
} as const;

export type Colors = Record<keyof typeof lightColors, string>;
export type ThemeMode = 'light' | 'dark';

const palettes: Record<ThemeMode, Colors> = { dark: darkColors, light: lightColors };

export const THEME_MODE_STORAGE_KEY = 'waggo:theme-mode';

/** ADR-018: the app ships light by default; the user opts into dark from `ThemeToggle`. */
let mode: ThemeMode = 'light';
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

/** Headings and buttons (vault › ADR-018). Loaded with `useFonts` in `src/app/_layout.tsx`. */
const fontFamilyHeading = 'Baloo2_700Bold';

/** Body text, labels and micro copy (vault › ADR-018). */
export const fontFamily = 'Inter_400Regular';
const fontFamilyBold = 'Inter_700Bold';
const fontFamilyMedium = 'Inter_500Medium';

/** Every font family `useFonts` must load before the app renders styled text. */
export const fontsToLoad = {
  Baloo2_700Bold: require('@expo-google-fonts/baloo-2/700Bold/Baloo2_700Bold.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;

/**
 * Minimum sizes (design proposal 03, approved by the PO): every touch target is at least 44, text fields 48,
 * chips 44 and the floating map buttons 48.
 */
export const sizes = { touch: 44, field: 48, chip: 44, fab: 48 } as const;

/** Soft elevation for cards and sheets floating over the map (design proposal 03). */
export const shadows = {
  card: { shadowColor: '#16212E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  sheet: { shadowColor: '#16212E', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.16, shadowRadius: 24 },
} as const;

/** Mobile first (ADR-013, unchanged by ADR-018): on tablets and web every screen keeps a phone-width column. */
export const layout = {
  column: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
} as const;

export const typography = {
  display: { fontFamily: fontFamilyHeading, fontSize: 34, lineHeight: 38, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontFamily: fontFamilyHeading, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { fontFamily: fontFamilyHeading, fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  caption: { fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  eyebrow: {
    fontFamily: fontFamilyBold,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  micro: { fontFamily: fontFamilyMedium, fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;
