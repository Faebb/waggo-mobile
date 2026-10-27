import { Pressable, Text, View } from 'react-native';

import {
  radius,
  setThemeMode,
  sizes,
  spacing,
  typography,
  useThemedStyles,
  useThemeMode,
  type ThemeMode,
} from './theme';

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Claro' },
  { mode: 'dark', label: 'Oscuro' },
];

/** Segmented control to switch the app's color theme (vault › ADR-015). A radio group (design proposal 07 · 23). */
export function ThemeToggle() {
  const mode = useThemeMode();
  const styles = useThemedStyles((colors) => ({
    track: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
    },
    option: {
      minHeight: sizes.touch,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    optionActive: { backgroundColor: colors.primary },
    label: { ...typography.caption, fontWeight: '700', color: colors.muted },
    labelActive: { color: colors.primaryText },
  }));

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Tema" style={styles.track}>
      {OPTIONS.map((option) => {
        const active = option.mode === mode;
        return (
          <Pressable
            key={option.mode}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
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
