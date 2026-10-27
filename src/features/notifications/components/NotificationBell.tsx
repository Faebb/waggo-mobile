import { Pressable, Text, View } from 'react-native';

import { BellIcon } from '@/shared/ui/icons/BellIcon';
import { radius, sizes, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useNotifications } from '../hooks/useNotifications';

type Props = { onPress: () => void };

/**
 * RF-014: round bell, top right of both homes, with the number of unread notices in a `primary` badge (design
 * proposal 07 · 22; red stays for errors). Announced as "Avisos, 2 sin leer".
 */
export function NotificationBell({ onPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    bell: {
      width: sizes.touch,
      height: sizes.touch,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: { opacity: 0.7 },
    count: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      paddingHorizontal: 5,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    countText: { ...typography.micro, fontWeight: '700', color: colors.primaryText },
  }));
  const inbox = useNotifications();
  const unread = inbox.data?.unreadCount ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Avisos, ${unread} sin leer` : 'Avisos'}
      onPress={onPress}
      style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
    >
      <BellIcon color={colors.text} size={22} />
      {unread > 0 && (
        <View style={styles.count}>
          <Text style={styles.countText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}
