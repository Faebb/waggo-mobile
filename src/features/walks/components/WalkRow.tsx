import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { StatusPill } from '@/shared/ui/StatusPill';
import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { formatWhen, petNamesOf, walkKindOf } from '../model/describeWalk';
import { WALK_STATUS_LABELS, type Walk } from '../model/types';
import { walkStatusTone } from '../model/walkStatusTone';

type Props = { walk: Walk; pets: readonly { id: string; name: string }[]; onPress: () => void };

/** One walk in a list (design proposal 07 · 19): dogs, when and kind, price and the status word with its color. */
export function WalkRow({ walk, pets, onPress }: Props) {
  const styles = useThemedStyles((colors) => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    pressed: { opacity: 0.85 },
    body: { flex: 1, gap: spacing.xs },
    pets: { ...typography.subtitle, color: colors.text },
    meta: { ...typography.caption, color: colors.muted },
    side: { alignItems: 'flex-end', gap: spacing.xs },
    price: { ...typography.body, fontWeight: '700', color: colors.text },
    chevron: { ...typography.title, color: colors.muted },
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.pets}>{petNamesOf(walk.petIds, pets)}</Text>
        <Text style={styles.meta}>{`${formatWhen(walk.scheduledFor)} · ${walkKindOf(walk)}`}</Text>
        <StatusPill label={WALK_STATUS_LABELS[walk.status]} tone={walkStatusTone(walk.status)} />
      </View>
      <View style={styles.side}>
        <Text style={styles.price}>{formatMoney(walk.total, walk.currency)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}
