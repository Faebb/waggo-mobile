import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

/**
 * The only theme: a pastel dark palette. Butter yellow is the only action color; red is reserved for errors and
 * emergencies. Every text pair meets WCAG AA (`theme.test.tsx`). There is no light mode and no user toggle.
 */
export const colors = {
  primary: '#FFD978',
  primaryText: '#2A2433',
  text: '#F3EEF9',
  muted: '#BDB4CB',
  surface: '#2A2433',
  surface2: '#352E42',
  background: '#1E1A26',
  border: '#4A4159',
  danger: '#FF9C94',
  onDanger: '#2A2433',
  success: '#A8E6C8',
} as const;

export type Colors = typeof colors;

export function useColors(): Colors {
  return colors;
}

/**
 * Builds a `StyleSheet` from the palette once per screen mount. The palette never changes at runtime, so the
 * sheet is not recomputed.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>>(
  factory: (palette: Colors) => T,
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(colors)), []);
}

/** Helvetica where the OS ships it; Android has no Helvetica, so it falls back to its system sans. */
export const fontFamily = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica' });

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/** Minimum touch target height in dp (WCAG 2.5.5 / Material). */
export const touch = { minHeight: 48 } as const;

export const radius = { sm: 6, md: 12, pill: 999 } as const;

/** Mobile first: on tablets and web every screen keeps a phone-width column. */
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
