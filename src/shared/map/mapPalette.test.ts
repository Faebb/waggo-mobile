import { mapPaletteOf } from './mapPalette';
import { darkColors, lightColors } from '../ui/theme';

describe('mapPaletteOf', () => {
  it('uses the app accent and leaves the light OSM tiles untouched in the light theme', () => {
    const palette = mapPaletteOf(lightColors, 'light');

    expect(palette.primary).toBe(lightColors.primary);
    expect(palette.danger).toBe(lightColors.danger);
    expect(palette.tileFilter).toBe('none');
  });

  it('darkens the tiles with a CSS filter in the dark theme (OSM has no dark style)', () => {
    const palette = mapPaletteOf(darkColors, 'dark');

    expect(palette.primary).toBe(darkColors.primary);
    expect(palette.tileFilter).toContain('invert(1)');
    expect(palette.tileFilter).toContain('hue-rotate(180deg)');
  });
});
