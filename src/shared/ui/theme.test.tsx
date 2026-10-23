import { Platform } from 'react-native';

import { colors, fontFamily, touch } from './theme';

describe('theme', () => {
  it('uses Helvetica as the typeface', () => {
    const expected = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica' });

    expect(fontFamily).toBe(expected);
    expect(fontFamily).toMatch(/Helvetica|sans-serif/);
  });

  it('has one pastel palette with butter yellow as the only action color', () => {
    expect(colors.primary).toBe('#FFD978');
    expect(colors.primaryText).toBe('#2A2433');
  });

  it('defines the minimum touch height of 48 dp', () => {
    expect(touch.minHeight).toBe(48);
  });

  it.each([
    ['text', 'background'],
    ['text', 'surface'],
    ['text', 'surface2'],
    ['muted', 'background'],
    ['muted', 'surface2'],
    ['primaryText', 'primary'],
    ['danger', 'background'],
    ['success', 'background'],
    ['onDanger', 'danger'],
  ] as const)('meets WCAG AA for %s on %s (4.5:1)', (ink, backdrop) => {
    expect(contrastRatio(colors[ink], colors[backdrop])).toBeGreaterThanOrEqual(4.5);
  });
});

/** WCAG 2.x relative luminance contrast ratio between two `#RRGGBB` colors. */
function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
