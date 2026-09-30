import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/ui/theme';

import type { ValuePillar } from '../model/valuePillars';

type Props = { index: number; pillar: ValuePillar };

/** Presentational: one numbered pillar of the value proposition, separated by a hairline. */
export function ValueCard({ index, pillar }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>{pillar.title}</Text>
        <Text style={styles.description}>{pillar.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  number: { ...typography.eyebrow, width: 24, paddingTop: 3, color: colors.primary },
  body: { flex: 1, gap: spacing.xs },
  title: { ...typography.subtitle, color: colors.text },
  description: { ...typography.body, color: colors.muted },
});
