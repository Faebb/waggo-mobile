import { Pressable, Text } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

/**
 * Full-width call to action: `primary` for the main action of a screen, `secondary` for the rest and `danger`
 * only for emergencies (RF-012).
 */
export function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const styles = useThemedStyles((colors) => ({
    button: {
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
    },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    danger: { backgroundColor: colors.danger },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
    label: typography.subtitle,
  }));
  const labelStyles = useThemedStyles((colors) => ({
    primary: { color: colors.primaryText },
    secondary: { color: colors.primary },
    danger: { color: colors.onDanger },
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}
