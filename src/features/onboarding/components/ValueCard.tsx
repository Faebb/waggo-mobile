import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import type { ValuePillar } from '../model/valuePillars';

type Props = { pillar: ValuePillar };

/** Presentational: one pillar of the value proposition. The icon is decorative. */
export function ValueCard({ pillar }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.iconText}>{pillar.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{pillar.title}</Text>
        <Text style={styles.description}>{pillar.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  iconText: { fontSize: 22 },
  body: { flex: 1, gap: spacing.xs },
  title: { ...typography.subtitle, color: colors.text },
  description: { ...typography.body, color: colors.muted },
});
