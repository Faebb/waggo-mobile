import { Platform } from 'react-native';

/** Dark theme with yellow as the only accent (vault › ADR-013). */
export const colors = {
  primary: '#FFC527',
  primaryText: '#14120A',
  primarySoft: '#2A2412',
  text: '#F4F1E8',
  muted: '#9A968A',
  surface: '#1A1A17',
  background: '#0F0F0D',
  border: '#2C2B26',
  danger: '#FF6B5E',
} as const;

/** Helvetica where the OS ships it; Android has no Helvetica, so it falls back to its system sans. */
export const fontFamily = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica' });

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 12, pill: 999 } as const;

export const typography = {
  display: { fontFamily, fontSize: 44, lineHeight: 46, fontWeight: '700', letterSpacing: -1.5 },
  title: { fontFamily, fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontFamily, fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontFamily, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { fontFamily, fontSize: 13, lineHeight: 17, fontWeight: '400' },
  eyebrow: { fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.5 },
} as const;
