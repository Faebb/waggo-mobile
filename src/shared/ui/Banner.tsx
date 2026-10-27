import { Pressable, Text, View } from 'react-native';

import { AlertIcon } from './icons/AlertIcon';
import { InfoIcon } from './icons/InfoIcon';
import { radius, sizes, spacing, typography, useColors, useThemedStyles, type Colors } from './theme';

export type BannerTone = 'info' | 'warning' | 'danger' | 'success';

type Props = {
  tone: BannerTone;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Accent color (stripe and icon) and readable title color per tone. */
const toneColors: Record<BannerTone, { accent: keyof Colors; text: keyof Colors }> = {
  info: { accent: 'info', text: 'text' },
  warning: { accent: 'warning', text: 'warningText' },
  danger: { accent: 'danger', text: 'danger' },
  success: { accent: 'success', text: 'success' },
};

/**
 * Inline notice (design proposal 03, `Banner`): an icon, an optional title and a message, so the meaning never
 * relies on color alone. `danger` and `warning` are announced as alerts.
 */
export function Banner({ tone, title, message, actionLabel, onAction }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    banner: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      borderLeftWidth: 4,
      backgroundColor: colors.surface,
    },
    body: { flex: 1, gap: spacing.xs },
    title: { ...typography.caption, fontWeight: '700' },
    message: { ...typography.caption, color: colors.text },
    action: { minHeight: sizes.touch, justifyContent: 'center', alignSelf: 'flex-start' },
    actionText: { ...typography.caption, fontWeight: '700', color: colors.primary },
  }));
  const accent = colors[toneColors[tone].accent];
  const isAlert = tone === 'danger' || tone === 'warning';
  const Icon = isAlert ? AlertIcon : InfoIcon;

  return (
    <View style={[styles.banner, { borderLeftColor: accent }]}>
      <Icon color={accent} size={20} />
      <View style={styles.body}>
        {/* The text is one element so the title and message are read together; the action stays reachable. */}
        <Text accessibilityRole={isAlert ? 'alert' : 'text'} accessibilityLiveRegion={isAlert ? 'assertive' : 'polite'}>
          {title !== undefined && (
            <Text style={[styles.title, { color: colors[toneColors[tone].text] }]}>
              {title}
              {'\n'}
            </Text>
          )}
          <Text style={styles.message}>{message}</Text>
        </Text>
        {actionLabel !== undefined && onAction !== undefined && (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
