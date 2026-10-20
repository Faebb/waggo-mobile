import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useThemedStyles } from './theme';

type Props = { label: string; value: string; highlight?: boolean };

/** "Label ............ value" row with a hairline on top, for details of a walk. */
export function DetailRow({ label, value, highlight = false }: Props) {
  const styles = useThemedStyles((colors) => ({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    label: { ...typography.body, color: colors.muted },
    value: { ...typography.body, flexShrink: 1, color: colors.text, textAlign: 'right' },
    highlight: { ...typography.subtitle, color: colors.primary },
  }));

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}
