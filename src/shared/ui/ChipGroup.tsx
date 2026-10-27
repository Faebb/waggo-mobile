import { Pressable, Text, View } from 'react-native';

import { radius, sizes, spacing, typography, useThemedStyles } from './theme';

type Option<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Single-choice group of chips. Accessible: each chip is a button with `selected` state. */
export function ChipGroup<T extends string | number>({ label, options, value, onChange }: Props<T>) {
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.sm },
    label: { ...typography.caption, fontWeight: '700', color: colors.muted },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
      minHeight: sizes.chip,
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
    },
    chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { ...typography.body, color: colors.text },
    chipTextSelected: { color: colors.primaryText, fontWeight: '700' },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
