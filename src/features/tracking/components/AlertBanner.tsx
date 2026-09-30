import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { alertTitleFor, formatTime, type AlertParty, type WalkAlert } from '../model/alerts';

type Props = { alert: WalkAlert; viewer: AlertParty };

/** RF-012: red banner with the latest alert of the walk, who raised it, when and the message. */
export function AlertBanner({ alert, viewer }: Props) {
  return (
    <View accessible accessibilityRole="alert" style={styles.banner}>
      <View style={styles.top}>
        <Text style={styles.title}>{alertTitleFor(alert, viewer)}</Text>
        <Text style={styles.time}>{formatTime(alert.raisedAt)}</Text>
      </View>
      {alert.message !== null && <Text style={styles.message}>{alert.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  title: { ...typography.subtitle, flexShrink: 1, color: colors.danger },
  time: { ...typography.caption, color: colors.muted },
  message: { ...typography.body, color: colors.text },
});
