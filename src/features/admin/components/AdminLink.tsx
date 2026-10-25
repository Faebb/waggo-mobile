import { Pressable, Text } from 'react-native';

import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

type Props = { onPress: () => void };

/** Only shown to `IsAdmin` users (ADR-017); opens the walker-verification queue (RF-002/RF-003). */
export function AdminLink({ onPress }: Props) {
  const styles = useThemedStyles((colors) => ({
    link: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
    label: { ...typography.body, fontWeight: '700', color: colors.primary },
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Panel de administración"
      onPress={onPress}
      hitSlop={spacing.sm}
      style={styles.link}
    >
      <Text style={styles.label}>Admin</Text>
    </Pressable>
  );
}
