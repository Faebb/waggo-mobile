import { StyleSheet, Text, View } from 'react-native';

import { MapRouteIcon } from '@/shared/ui/icons/MapRouteIcon';
import { ShieldCheckIcon } from '@/shared/ui/icons/ShieldCheckIcon';
import { WalletCheckIcon } from '@/shared/ui/icons/WalletCheckIcon';
import { radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import type { ValuePillar } from '../model/valuePillars';

type Props = { index: number; pillar: ValuePillar };

/** One icon per pillar, in the order they're declared (vault › Visión del proyecto). */
const PILLAR_ICONS = [ShieldCheckIcon, MapRouteIcon, WalletCheckIcon];

/** Presentational: one pillar of the value proposition, with an icon badge, separated by a hairline. */
export function ValueCard({ index, pillar }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    badge: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: spacing.xs },
    title: { ...typography.subtitle, color: colors.text },
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
