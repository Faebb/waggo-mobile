import { Text, View } from 'react-native';

import { MapRouteIcon } from '@/shared/ui/icons/MapRouteIcon';
import { ShieldCheckIcon } from '@/shared/ui/icons/ShieldCheckIcon';
import { WalletCheckIcon } from '@/shared/ui/icons/WalletCheckIcon';
import { radius, sizes, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import type { ValuePillar } from '../model/valuePillars';

type Props = { index: number; pillar: ValuePillar };

/** One icon per pillar, in the order they're declared (vault › Visión del proyecto). */
const PILLAR_ICONS = [ShieldCheckIcon, MapRouteIcon, WalletCheckIcon];

/** Presentational: one pillar of the value proposition, with a round icon badge (design proposal 07 · 1). */
export function ValueCard({ index, pillar }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
    },
    badge: {
      width: sizes.touch,
      height: sizes.touch,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: spacing.xs },
    title: { ...typography.body, fontFamily: typography.eyebrow.fontFamily, color: colors.text },
    description: { ...typography.body, color: colors.muted },
  }));
  const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];

  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Icon color={colors.primary} size={20} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{pillar.title}</Text>
        <Text style={styles.description}>{pillar.description}</Text>
      </View>
    </View>
  );
}
