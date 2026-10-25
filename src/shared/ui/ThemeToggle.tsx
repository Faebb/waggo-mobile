import { Pressable, Text, View } from 'react-native';

import { radius, spacing, typography, useThemedStyles, useThemeMode, setThemeMode, type ThemeMode } from './theme';

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Claro' },
  { mode: 'dark', label: 'Oscuro' },
];

/** Segmented control to switch the app's color theme (vault › ADR-015). Text only for now; the mockup (ADR-018) shows a small sun/moon icon per option, not yet added. */
export function ThemeToggle() {
  const mode = useThemeMode();
  const styles = useThemedStyles((colors) => ({
    track: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: 4,
      marginRight: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
    },
    option: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.pill },
    optionActive: { backgroundColor: colors.primary },
    label: { ...typography.caption, fontWeight: '700', color: colors.muted },
    labelActive: { color: colors.primaryText },
  }));

  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => {
        const active = option.mode === mode;
        return (
          <Pressable
            key={option.mode}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setThemeMode(option.mode)}
            style={[styles.option, active && styles.optionActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
