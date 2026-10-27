import { Pressable, Text, View } from 'react-native';

import { radius, shadows, sizes, spacing, typography, useThemedStyles } from './theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  /** Accessible name of the whole control, e.g. "Sección". */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Switches between views of one screen (design proposal 03, segmented selector: admin "Paseadores / Operación").
 * A tab list: each segment is a `tab` with its `selected` state, so it never relies on color alone.
 */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  const styles = useThemedStyles((colors) => ({
    track: {
      flexDirection: 'row',
      padding: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
    },
    segment: {
      flex: 1,
      minHeight: sizes.touch,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    segmentSelected: { backgroundColor: colors.surface, ...shadows.card },
    text: { ...typography.caption, fontWeight: '700', color: colors.muted },
    textSelected: { color: colors.text },
  }));

  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
