import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { radius, sizes, spacing, typography, useColors, useThemedStyles } from './theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  hint?: string;
  error?: string;
} & Pick<
  TextInputProps,
  | 'keyboardType'
  | 'multiline'
  | 'placeholder'
  | 'autoCapitalize'
  | 'maxLength'
  | 'secureTextEntry'
  | 'autoComplete'
  | 'editable'
>;

/**
 * Labeled text input (design proposal 03): 48 px tall, `borderStrong` outline (≥ 3:1), `primary` 2 px outline on
 * focus, `danger` outline plus the message below on error, or the hint when there is no error. A password field
 * gets a "Mostrar" toggle.
 */
export function TextField({
  label,
  value,
  onChangeText,
  hint,
  error,
  multiline,
  secureTextEntry,
  ...inputProps
}: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.xs },
    label: { ...typography.caption, fontWeight: '700', color: colors.muted },
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: sizes.field,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
    },
    boxFocused: { borderWidth: 2, borderColor: colors.primary },
    boxError: { borderWidth: 2, borderColor: colors.danger },
    input: {
      ...typography.body,
      flex: 1,
      minHeight: sizes.field - 2,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
    },
    multiline: { minHeight: 96, textAlignVertical: 'top' },
    reveal: { minHeight: sizes.touch, justifyContent: 'center', paddingHorizontal: spacing.md },
    revealText: { ...typography.caption, fontWeight: '700', color: colors.primary },
    error: { ...typography.caption, color: colors.danger },
    hint: { ...typography.caption, color: colors.muted },
  }));
  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.boxFocused, error !== undefined && styles.boxError]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          secureTextEntry={isPassword && !revealed}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          style={[styles.input, multiline && styles.multiline]}
          {...inputProps}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setRevealed((current) => !current)}
            style={styles.reveal}
          >
            <Text style={styles.revealText}>{revealed ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
      {error !== undefined ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        hint !== undefined && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}
