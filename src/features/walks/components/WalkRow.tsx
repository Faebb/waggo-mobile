import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { formatWhen, petNamesOf, walkKindOf } from '../model/describeWalk';
import { ACTIVE_STATUSES, WALK_STATUS_LABELS, type Walk } from '../model/types';

type Props = { walk: Walk; pets: readonly { id: string; name: string }[]; onPress: () => void };

/** One walk in a list: status, dogs, when and price. Active walks get the yellow mark. */
export function WalkRow({ walk, pets, onPress }: Props) {
  const active = ACTIVE_STATUSES.includes(walk.status);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.mark, active && styles.markActive]} />
      <View style={styles.body}>
        <Text style={[styles.status, active && styles.statusActive]}>{WALK_STATUS_LABELS[walk.status]}</Text>
        <Text style={styles.pets}>{petNamesOf(walk.petIds, pets)}</Text>
        <Text style={styles.meta}>{`${formatWhen(walk.scheduledFor)} · ${walkKindOf(walk)}`}</Text>
      </View>
      <Text style={styles.price}>{formatMoney(walk.total, walk.currency)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  mark: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.border },
  markActive: { backgroundColor: colors.primary },
  body: { flex: 1, gap: 2 },
  status: { ...typography.eyebrow, color: colors.muted },
  statusActive: { color: colors.primary },
  pets: { ...typography.subtitle, color: colors.text },
  meta: { ...typography.caption, color: colors.muted },
  price: { ...typography.body, fontWeight: '700', color: colors.text },
});
