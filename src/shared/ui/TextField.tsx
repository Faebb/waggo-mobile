import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from './theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  hint?: string;
  error?: string;
} & Pick<TextInputProps, 'keyboardType' | 'multiline' | 'placeholder' | 'autoCapitalize' | 'maxLength'>;

/** Labeled text input. Shows the error below the field, or the hint when there is no error. */
export function TextField({ label, value, onChangeText, hint, error, multiline, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        style={[styles.input, multiline && styles.multiline, error !== undefined && styles.inputError]}
        {...inputProps}
      />
      {error !== undefined ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        hint !== undefined && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '700', color: colors.muted },
  input: {
    ...typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
  hint: { ...typography.caption, color: colors.muted },
});
