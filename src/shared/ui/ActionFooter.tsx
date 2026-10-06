import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, useThemedStyles } from './theme';

type Props = { children: ReactNode };

/** Bottom area of a screen with its main actions, within thumb reach (ADR-013). */
export function ActionFooter({ children }: Props) {
  const styles = useThemedStyles((colors) => ({
    footer: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  }));

  return <View style={styles.footer}>{children}</View>;
}
