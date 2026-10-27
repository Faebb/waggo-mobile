import { Text, View } from 'react-native';

import { Button } from './Button';
import { PawIcon } from './icons/PawIcon';
import { radius, spacing, typography, useColors, useThemedStyles } from './theme';

type Props = { title: string; message?: string; actionLabel?: string; onAction?: () => void };

/** Empty list (design proposal 03, `EmptyState`): a paw badge, a title, a short explanation and its next step. */
export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    container: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
    badge: {
      width: 72,
      height: 72,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
    message: { ...typography.body, color: colors.muted, textAlign: 'center' },
    action: { alignSelf: 'stretch' },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <PawIcon color={colors.primary} size={32} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {message !== undefined && <Text style={styles.message}>{message}</Text>}
      {actionLabel !== undefined && onAction !== undefined && (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
