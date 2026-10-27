import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatWhen } from '@/features/walks';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { AlertIcon } from '@/shared/ui/icons/AlertIcon';
import { BellIcon } from '@/shared/ui/icons/BellIcon';
import { layout, radius, sizes, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useMarkNotificationsRead, useNotifications } from '../hooks/useNotifications';
import { dayLabelOf } from '../model/dayLabel';
import type { AppNotification } from '../model/types';

type Props = { onOpenWalk: (walkId: string) => void };

/**
 * RF-014: the inbox (design proposal 07 · 22), grouped by day. Opening it marks everything as read; each notice
 * opens its walk. Urgent notices carry an alert icon and the word "URGENTE", not only color.
 */
export function NotificationsScreen({ onOpenWalk }: Props) {
  const styles = useThemedStyles((colors) => ({
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    section: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
  }));
  const colors = useColors();
  const inbox = useNotifications();
  const { mutate: markRead } = useMarkNotificationsRead();

  useEffect(() => {
    markRead();
  }, [markRead]);

  const groups: { day: string; items: AppNotification[] }[] = [];
  for (const notification of inbox.data?.items ?? []) {
    const day = dayLabelOf(notification.createdAt);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(notification);
    else groups.push({ day, items: [notification] });
  }

  return (
    <ScrollView contentContainerStyle={[styles.column, styles.content]}>
      <Text accessibilityRole="header" style={styles.title}>
        Avisos
      </Text>

      {inbox.isPending && <ActivityIndicator accessibilityLabel="Cargando avisos" color={colors.primary} />}
      {inbox.isError && inbox.data === undefined && (
        <ErrorState message="No pudimos cargar tus avisos." onRetry={() => void inbox.refetch()} />
      )}
      {inbox.data?.items.length === 0 && (
        <EmptyState title="No tienes avisos todavía" message="Aquí verás cada momento de tus paseos." />
      )}

      {groups.map((group) => (
        <View key={group.day} style={styles.section}>
          <Text style={styles.eyebrow}>{group.day.toUpperCase()}</Text>
          {group.items.map((notification) => (
            <NoticeRow
              key={notification.id}
              notification={notification}
              onPress={() => onOpenWalk(notification.walkId)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function NoticeRow({ notification, onPress }: { notification: AppNotification; onPress: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    urgentRow: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
    pressed: { opacity: 0.85 },
    icon: {
      width: sizes.touch,
      height: sizes.touch,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface2,
    },
    body: { flex: 1, gap: 2 },
    urgent: { ...typography.eyebrow, color: colors.danger },
    rowTitle: { ...typography.subtitle, color: colors.text },
    rowBody: { ...typography.body, color: colors.muted },
    rowTime: { ...typography.caption, color: colors.muted },
    unread: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      marginTop: spacing.sm,
    },
  }));
  const urgent = notification.priority === 'High';
  const unread = notification.readAt === null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${urgent ? 'Urgente. ' : ''}${notification.title}. ${notification.body}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, urgent && styles.urgentRow, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        {urgent ? <AlertIcon color={colors.danger} size={20} /> : <BellIcon color={colors.primary} size={20} />}
      </View>
      <View style={styles.body}>
        {urgent && <Text style={styles.urgent}>URGENTE</Text>}
        <Text style={styles.rowTitle}>{notification.title}</Text>
        <Text style={styles.rowBody}>{notification.body}</Text>
        <Text style={styles.rowTime}>{formatWhen(notification.createdAt)}</Text>
      </View>
      {unread && <View style={styles.unread} />}
    </Pressable>
  );
}
