import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { useMyEarnings } from '../hooks/usePayments';

/** RF-017: what the walker has earned, like the earnings screen of a driver. Hidden while loading or on error. */
export function EarningsCard() {
  const earnings = useMyEarnings();
  if (earnings.data === undefined) {
    return null;
  }

  const { currency, total, walks } = earnings.data;
  return (
    <View accessible style={styles.card}>
      <Text style={styles.eyebrow}>GANANCIAS</Text>
      {currency === null ? (
        <Text style={styles.empty}>Acepta una solicitud y cobra al terminar el paseo.</Text>
      ) : (
        <>
          <Text style={styles.total}>{formatMoney(total, currency)}</Text>
          <Text style={styles.count}>{walks.length === 1 ? '1 paseo pagado' : `${walks.length} paseos pagados`}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  total: { ...typography.title, color: colors.primary },
  count: { ...typography.caption, color: colors.muted },
  empty: { ...typography.body, color: colors.text },
});
