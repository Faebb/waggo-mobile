import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyEarnings } from '@/features/payments';
import { formatMoney } from '@/features/pricing';
import { formatWhen } from '@/features/walks';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatusPill } from '@/shared/ui/StatusPill';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

/**
 * RF-017: the walker's "Ganancias" tab (design proposal 07 · 32, ADR-019 as amended): the total with the number of
 * paid walks and one row per paid walk, the most recent first.
 */
export function EarningsScreen() {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    card: { gap: spacing.xs, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primary },
    cardLabel: { ...typography.eyebrow, color: colors.primaryText },
    total: { ...typography.display, color: colors.primaryText },
    count: { ...typography.caption, color: colors.primaryText },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    rowWhen: { ...typography.body, color: colors.text },
    rowAmount: { ...typography.subtitle, color: colors.text },
  }));
  const earnings = useMyEarnings();
  const data = earnings.data;
  const currency = data?.currency ?? null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[layout.column, styles.content]}>
        <Text accessibilityRole="header" style={styles.title}>
          Ganancias
        </Text>

        {earnings.isPending && <Skeleton width="100%" height={120} radius={radius.lg} />}
        {earnings.isError && (
          <ErrorState message="No pudimos cargar tus ganancias." onRetry={() => void earnings.refetch()} />
        )}
        {data !== undefined && data.walks.length === 0 && (
          <EmptyState title="Aún no tienes ganancias" message="Cuando termines tu primer paseo, lo verás aquí." />
        )}
        {data !== undefined && data.walks.length > 0 && currency !== null && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>TOTAL GANADO</Text>
              <Text style={styles.total}>{formatMoney(data.total, currency)}</Text>
              <Text style={styles.count}>
                {data.walks.length === 1 ? '1 paseo pagado' : `${data.walks.length} paseos pagados`}
              </Text>
            </View>
            <View>
              {data.walks.map((walk) => (
                <View key={walk.walkId} style={styles.row}>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowWhen}>{formatWhen(walk.capturedAt)}</Text>
                    <StatusPill label="Pagado" tone="success" />
                  </View>
                  <Text style={styles.rowAmount}>{formatMoney(walk.walkerPayout, currency)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
