import { Text, View } from 'react-native';

import { BrandLogo } from './BrandLogo';
import { spacing, typography, useThemedStyles } from './theme';

type Props = { title: string; subtitle?: string };

/**
 * Header of the sign-in flow (login, register, confirm, password reset), design proposal 07 · 2–5: the title and a
 * one-line lead. The corgi head sits in the navigation bar, top right, next to the back arrow (`AuthBarLogo`).
 */
export function AuthHeader({ title, subtitle }: Props) {
  const styles = useThemedStyles((colors) => ({
    header: { gap: spacing.xs, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    title: { ...typography.title, color: colors.text },
    subtitle: { ...typography.body, color: colors.muted },
  }));

  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

/** Corgi head (36 px; the cream medal on the dark theme) for the right side of the sign-in navigation bar. */
export function AuthBarLogo() {
  const styles = useThemedStyles(() => ({ logo: { paddingHorizontal: spacing.md } }));
  return (
    <View style={styles.logo}>
      <BrandLogo variant="head" size={36} />
    </View>
  );
}
