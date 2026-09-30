import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatWhen } from '@/features/walks';
import { colors, layout, radius, spacing, typography } from '@/shared/ui/theme';

import { useMarkNotificationsRead, useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../model/types';

type Props = { onOpenWalk: (walkId: string) => void };

/** RF-014: the inbox. Opening it marks everything as read; each notice opens its walk. */
export function NotificationsScreen({ onOpenWalk }: Props) {
  const inbox = useNotifications();
  const { mutate: markRead } = useMarkNotificationsRead();

  useEffect(() => {
    markRead();
  }, [markRead]);

  return (
    <ScrollView contentContainerStyle={[styles.column, styles.content]}>
      <Text accessibilityRole="header" style={styles.title}>
        Avisos
      </Text>

      {inbox.isPending && <ActivityIndicator accessibilityLabel="Cargando avisos" color={colors.primary} />}
      {inbox.isError && inbox.data === undefined && (
        <Text accessibilityRole="alert" style={styles.error}>
          No pudimos cargar tus avisos. Intenta de nuevo.
        </Text>
      )}
      {inbox.data?.items.length === 0 && <Text style={styles.empty}>No tienes avisos todavía.</Text>}

      <View>
        {inbox.data?.items.map((notification) => (
          <NoticeRow
            key={notification.id}
            notification={notification}
            onPress={() => onOpenWalk(notification.walkId)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function NoticeRow({ notification, onPress }: { notification: AppNotification; onPress: () => void }) {
  const urgent = notification.priority === 'High';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.body}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {urgent && <Text style={styles.urgent}>URGENTE</Text>}
      <Text style={[styles.rowTitle, urgent && styles.rowTitleUrgent]}>{notification.title}</Text>
      <Text style={styles.rowBody}>{notification.body}</Text>
      <Text style={styles.rowTime}>{formatWhen(notification.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: layout.column,
  content: { gap: spacing.lg, padding: spacing.lg },
  title: { ...typography.display, color: colors.text },
  error: { ...typography.body, color: colors.danger },
  empty: { ...typography.body, color: colors.muted },
  row: {
    gap: 2,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pressed: { opacity: 0.85, borderRadius: radius.sm },
  urgent: { ...typography.eyebrow, color: colors.danger },
  rowTitle: { ...typography.subtitle, color: colors.text },
  rowTitleUrgent: { color: colors.danger },
  rowBody: { ...typography.body, color: colors.muted },
  rowTime: { ...typography.caption, color: colors.muted },
});
