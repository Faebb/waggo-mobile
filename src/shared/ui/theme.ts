export const colors = {
  primary: '#2F7D5B',
  primaryText: '#FFFFFF',
  primarySoft: '#E3F1EA',
  text: '#1F2A24',
  muted: '#5F6B64',
  surface: '#FFFFFF',
  background: '#F4F7F5',
  border: '#D5DED9',
  danger: '#B3261E',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { md: 12, lg: 20, pill: 999 } as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
} as const;
