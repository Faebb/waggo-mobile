import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { radius, sizes, spacing, typography, useColors, useThemedStyles, type Colors } from './theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'tertiary';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Shows a spinner, blocks presses and announces "busy" (design proposal 03, `Button` loading state). */
  loading?: boolean;
  /** Label while loading, e.g. "Pidiendo…". Defaults to `label`. */
  loadingLabel?: string;
};

const labelColor: Record<Variant, keyof Colors> = {
  primary: 'primaryText',
  secondary: 'text',
  danger: 'dangerText',
  tertiary: 'primary',
};

/**
 * Full-width call to action: `primary` for the main action of a screen, `secondary` for the rest, `danger` only
 * for emergencies (RF-012) and `tertiary` for a text link ("Iniciar sesión").
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingLabel,
}: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    button: {
      minHeight: sizes.touch,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
    },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.text },
    danger: { backgroundColor: colors.danger },
    tertiary: { backgroundColor: 'transparent', paddingVertical: spacing.sm },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    label: typography.subtitle,
  }));
  const color = colors[labelColor[variant]];
  const blocked = disabled || loading;
  const text = loading ? (loadingLabel ?? label) : label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}
    >
      <View style={styles.row}>
        {loading && <ActivityIndicator color={color} />}
        <Text style={[styles.label, { color }]}>{text}</Text>
      </View>
    </Pressable>
  );
}
