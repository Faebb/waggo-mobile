import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { formatMoney } from '../model/formatMoney';
import { WALK_TYPE_LABELS, type FareQuote } from '../model/types';

type Props = { quote: FareQuote };

/** Presentational: renders a fare quote (RF-019) and the walker's share (RF-018). */
export function FareQuoteCard({ quote }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>
        {`Paseo ${WALK_TYPE_LABELS[quote.walkType].toLowerCase()} · ${quote.durationMinutes} min`}
      </Text>
      <Text accessibilityLabel="Total a pagar" style={styles.total}>
        {formatMoney(quote.total, quote.currency)}
      </Text>
      <View style={styles.row}>
        <Text style={styles.muted}>Para el paseador</Text>
        <Text accessibilityLabel="Para el paseador" style={styles.muted}>
          {formatMoney(quote.walkerPayout, quote.currency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtitle: { ...typography.body, color: colors.muted },
  total: { ...typography.display, color: colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { ...typography.caption, color: colors.muted },
});
