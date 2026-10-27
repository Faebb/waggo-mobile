import { Image, View } from 'react-native';

import { lightColors, radius, useThemeMode } from './theme';

type Props = {
  /** `full` = head + "Waggo" lettering (welcome, splash); `head` = head only (auth screens). */
  variant: 'full' | 'head';
  /** Width of the full logo, or height of the head, in px. */
  size: number;
};

// PROVISIONAL (design proposal 08): an automatic recolor of the founder's sketch, not the final vector logo.
const fullLogo = require('../../../assets/brand/logo-full.png');
const headLogo = require('../../../assets/brand/logo-head.png');
/** Aspect ratio (width / height) of `logo-head.png`, 236 × 300 px. */
const HEAD_RATIO = 236 / 300;
/** The medal is always the light cream, also on the dark theme (design proposal 08). */
const MEDAL_COLOR = lightColors.background;

/**
 * Waggo logo (design proposal 08), read as one image labeled "Waggo". On the dark theme it sits on the cream
 * medal: inverting the ink would leave the corgi unrecognizable.
 */
export function BrandLogo({ variant, size }: Props) {
  const dark = useThemeMode() === 'dark';

  if (!dark) {
    const style = variant === 'full' ? { width: size, height: size } : { width: size * HEAD_RATIO, height: size };
    return (
      <Image
        accessible
        accessibilityRole="image"
        accessibilityLabel="Waggo"
        source={variant === 'full' ? fullLogo : headLogo}
        style={style}
      />
    );
  }

  const medal = Math.round(variant === 'full' ? size * 1.15 : size);
  const head = Math.round(medal * 0.78);
  return (
    <View
      testID="brand-medal"
      style={{
        width: medal,
        height: medal,
        borderRadius: radius.pill,
        backgroundColor: MEDAL_COLOR,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Image
        accessible
        accessibilityRole="image"
        accessibilityLabel="Waggo"
        source={headLogo}
        style={{ width: head * HEAD_RATIO, height: head }}
      />
    </View>
  );
}
