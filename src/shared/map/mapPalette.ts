import type { Colors, ThemeMode } from '@/shared/ui/theme';

import type { MapPalette } from './types';

/**
 * Map tokens of design proposal 04 / tokens.json (`map.land`, `map.routeCasing`). OSM raster tiles cannot be
 * restyled per layer like Mapbox: the light theme shows them as they are and the dark theme inverts them with a
 * CSS filter (streets dark, water and parks keep a similar hue). Markers, route and zone use the app palette.
 */
const MAP_TOKENS = {
  light: { land: '#F7EFE9', routeCasing: '#FFFFFF', tileFilter: 'none' },
  dark: {
    land: '#1A2531',
    routeCasing: '#16212E',
    tileFilter: 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.6)',
  },
} as const;

export function mapPaletteOf(colors: Colors, mode: ThemeMode): MapPalette {
  return {
    primary: colors.primary,
    primaryText: colors.primaryText,
    secondary: colors.secondary,
    danger: colors.danger,
    dangerText: colors.dangerText,
    muted: colors.muted,
    surface: colors.surface,
    text: colors.text,
    ...MAP_TOKENS[mode],
  };
}
