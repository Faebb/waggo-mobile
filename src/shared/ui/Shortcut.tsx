import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useThemedStyles } from './theme';

type Props = { title: string; detail: string; onPress: () => void };

/** "Title / detail ›" row with a hairline on top, for a list of account shortcuts. */
export function Shortcut({ title, detail, onPress }: Props) {
  const styles = useThemedStyles((colors) => ({
    pressed: { opacity: 0.85 },
    shortcut: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    shortcutText: { flex: 1, gap: 2 },
    shortcutTitle: { ...typography.subtitle, color: colors.text },
    shortcutDetail: { ...typography.caption, color: colors.muted },
    chevron: { ...typography.title, color: colors.muted },
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
    >
      <View style={styles.shortcutText}>
        <Text style={styles.shortcutTitle}>{title}</Text>
        <Text style={styles.shortcutDetail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}
