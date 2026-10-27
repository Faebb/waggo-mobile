import { Text, View } from 'react-native';

import { radius, spacing, typography, useColors, useThemedStyles, type Colors } from './theme';

export type StatusTone = 'info' | 'primary' | 'success' | 'muted' | 'danger';

type Props = { label: string; tone: StatusTone };

const toneColor: Record<StatusTone, keyof Colors> = {
  info: 'secondary',
  primary: 'primary',
  success: 'success',
  muted: 'muted',
  danger: 'danger',
};

/** Walk status (design proposal 03, `StatusPill`): a colored dot plus the status word, never only a color. */
export function StatusPill({ label, tone }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
    },
    dot: { width: 8, height: 8, borderRadius: radius.pill },
    label: { ...typography.micro, color: colors.text },
  }));

  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: colors[toneColor[tone]] }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
