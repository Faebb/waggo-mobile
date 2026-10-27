import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMoney } from '@/features/pricing';
import { formatWhen, WALK_STATUS_LABELS, walkStatusTone, type Walk, type WalkStatus } from '@/features/walks';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatusPill } from '@/shared/ui/StatusPill';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useAssignedWalks } from '../hooks/useWalker';

type Props = { onOpenWalk: (id: string) => void };

/** Sections of the tab (design proposal 07 · 33), in the order they are shown. */
const SECTIONS: { title: string; statuses: readonly WalkStatus[] }[] = [
  { title: 'EN CURSO', statuses: ['InProgress'] },
  { title: 'PRÓXIMOS', statuses: ['Requested', 'Accepted'] },
  { title: 'HISTORIAL', statuses: ['Completed', 'Cancelled'] },
];

/** RF-007, walker side: the "Paseos" tab with the walks this walker accepted (ADR-019 as amended). */
export function WalkerWalksScreen({ onOpenWalk }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    section: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    pressed: { opacity: 0.85 },
    rowBody: { flex: 1, gap: spacing.xs },
    address: { ...typography.subtitle, color: colors.text },
    meta: { ...typography.caption, color: colors.muted },
    payout: { ...typography.body, fontWeight: '700', color: colors.text },
  }));
  const walks = useAssignedWalks();
  const inSection = (statuses: readonly WalkStatus[]): Walk[] =>
    walks.data?.filter((walk) => statuses.includes(walk.status)) ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[layout.column, styles.content]}>
        <Text accessibilityRole="header" style={styles.title}>
          Tus paseos
        </Text>

        {walks.isPending && <Skeleton width="100%" height={72} radius={radius.md} />}
        {walks.isError && <ErrorState message="No pudimos cargar tus paseos." onRetry={() => void walks.refetch()} />}
        {walks.data?.length === 0 && (
          <EmptyState title="Aún no tienes paseos" message="Acepta una solicitud desde Inicio y la verás aquí." />
        )}
        {SECTIONS.map(({ title, statuses }) => {
          const list = inSection(statuses);
          if (list.length === 0) return null;
          return (
            <View key={title} style={styles.section}>
              <Text style={styles.eyebrow}>{title}</Text>
              {list.map((walk) => (
                <Pressable
                  key={walk.id}
                  accessibilityRole="button"
                  onPress={() => onOpenWalk(walk.id)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View style={styles.rowBody}>
                    <Text style={styles.address}>{walk.pickupAddress}</Text>
                    <Text style={styles.meta}>{formatWhen(walk.scheduledFor)}</Text>
                    <StatusPill label={WALK_STATUS_LABELS[walk.status]} tone={walkStatusTone(walk.status)} />
                  </View>
                  <Text style={styles.payout}>{formatMoney(walk.walkerPayout, walk.currency)}</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
