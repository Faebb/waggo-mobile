import { Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { formatWhen } from '@/features/walks';
import { Button } from '@/shared/ui/Button';
import { radius, shadows, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { formatDistance, offerKindOf } from '../model/describeOffer';
import type { AvailableWalk } from '../model/types';

type Props = { offer: AvailableWalk; onAccept: () => void; accepting: boolean; taken?: boolean };

/**
 * An open request, like a ride request for a driver (design proposal 07 · 28): what you earn first, then what and
 * where. When someone else took it first (409) it stays dimmed as "Ya no disponible".
 */
export function OfferCard({ offer, onAccept, accepting, taken = false }: Props) {
  const styles = useThemedStyles((colors) => ({
    card: {
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    taken: { opacity: 0.6 },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
    payout: { ...typography.title, color: colors.primary },
    distance: { ...typography.caption, fontWeight: '700', color: colors.text },
    kind: { ...typography.subtitle, color: colors.text },
    meta: { ...typography.body, color: colors.muted },
    takenText: { ...typography.caption, fontWeight: '700', color: colors.muted },
  }));

  return (
    <View style={[styles.card, taken && styles.taken]}>
      <View style={styles.top}>
        <Text style={styles.payout}>{`Ganas ${formatMoney(offer.walkerPayout, offer.currency)}`}</Text>
        {offer.distanceKm !== null && <Text style={styles.distance}>{formatDistance(offer.distanceKm)}</Text>}
      </View>
      <Text style={styles.kind}>{offerKindOf(offer)}</Text>
      <Text style={styles.meta}>{`${offer.pickupAddress} · ${formatWhen(offer.scheduledFor)}`}</Text>
      {taken ? (
        <Text style={styles.takenText}>Ya no disponible</Text>
      ) : (
        <Button label="Aceptar" loadingLabel="Aceptando…" loading={accepting} onPress={onAccept} />
      )}
    </View>
  );
}
