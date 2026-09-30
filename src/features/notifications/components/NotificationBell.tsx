import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { useNotifications } from '../hooks/useNotifications';

type Props = { onPress: () => void };

/** RF-014: "Avisos" with the number of unread notices, top right of both homes. Text only, no icon (ADR-013). */
export function NotificationBell({ onPress }: Props) {
  const inbox = useNotifications();
  const unread = inbox.data?.unreadCount ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Avisos, ${unread} sin leer` : 'Avisos'}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Avisos</Text>
      {unread > 0 && (
        <View style={styles.count}>
          <Text style={styles.countText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bell: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  pressed: { opacity: 0.7 },
  label: { ...typography.body, fontWeight: '700', color: colors.text },
  count: {
    minWidth: 22,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  countText: { ...typography.caption, fontWeight: '700', color: colors.primaryText },
});
