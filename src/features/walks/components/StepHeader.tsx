import { Pressable, Text, View } from 'react-native';

import { sizes, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

type Props = { step: number; total: number; title: string; onBack?: () => void };

/** "Paso 2 de 3" plus the step title, with a way back to the previous step (design proposal 07 · 11–13). */
export function StepHeader({ step, total, title, onBack }: Props) {
  const styles = useThemedStyles((colors) => ({
    header: { gap: spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    back: { minWidth: sizes.touch, minHeight: sizes.touch, justifyContent: 'center' },
    backText: { ...typography.title, color: colors.text },
    step: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
  }));

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {onBack !== undefined && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver al paso anterior"
            onPress={onBack}
            style={styles.back}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        )}
        <Text style={styles.step}>{`Paso ${step} de ${total}`}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}
