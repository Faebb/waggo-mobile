import { Text, View } from 'react-native';

import { BrandMark } from './BrandMark';
import { PawIcon } from './icons/PawIcon';
import { radius, spacing, typography, useColors, useThemedStyles } from './theme';

type Props = { title: string; subtitle?: string };

/**
 * Colored header shared by the sign-in flow (login, register, confirm): the Waggo mark plus a faint paw pattern,
 * so those screens read as one family instead of a bare title (inspired by the reference onboarding/auth mockup
 * the user shared, in the Seashell & Sapphire palette instead of its orange).
 */
export function AuthHeader({ title, subtitle }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    header: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: radius.lg,
      borderBottomRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      gap: spacing.lg,
      overflow: 'hidden',
    },
    decoration: { ...StyleSheetAbsoluteFill },
    text: { gap: spacing.xs },
    title: { ...typography.display, color: colors.primaryText },
    subtitle: { ...typography.body, color: colors.primaryText, opacity: 0.85 },
  }));

  return (
    <View style={styles.header}>
      <View style={styles.decoration} pointerEvents="none">
        <PawDot top={-10} right={-6} rotate="-18deg" size={64} color={colors.primaryText} opacity={0.12} />
        <PawDot top={54} right={54} rotate="12deg" size={34} color={colors.primaryText} opacity={0.14} />
        <PawDot top={6} right={110} rotate="-6deg" size={22} color={colors.primaryText} opacity={0.12} />
      </View>

      <BrandMark variant="inverted" />

      <View style={styles.text}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const StyleSheetAbsoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

type PawDotProps = { top: number; right: number; rotate: string; size: number; color: string; opacity: number };

function PawDot({ top, right, rotate, size, color, opacity }: PawDotProps) {
  return (
    <View style={{ position: 'absolute', top, right, opacity, transform: [{ rotate }] }}>
      <PawIcon color={color} size={size} />
    </View>
  );
}
