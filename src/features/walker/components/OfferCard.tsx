import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { formatWhen } from '@/features/walks';
import { Button } from '@/shared/ui/Button';
import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { formatDistance, offerKindOf } from '../model/describeOffer';
import type { AvailableWalk } from '../model/types';

type Props = { offer: AvailableWalk; onAccept: () => void; accepting: boolean };

/** An open request, like a ride request for a driver: what you earn first, then what and where. */
export function OfferCard({ offer, onAccept, accepting }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.payout}>{`Ganas ${formatMoney(offer.walkerPayout, offer.currency)}`}</Text>
        {offer.distanceKm !== null && <Text style={styles.distance}>{formatDistance(offer.distanceKm)}</Text>}
      </View>
      <Text style={styles.kind}>{offerKindOf(offer)}</Text>
      <Text style={styles.meta}>{offer.pickupAddress}</Text>
      <Text style={styles.meta}>{formatWhen(offer.scheduledFor)}</Text>
      <Button label={accepting ? 'Aceptando…' : 'Aceptar'} onPress={onAccept} disabled={accepting} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  payout: { ...typography.title, color: colors.primary },
  distance: { ...typography.caption, fontWeight: '700', color: colors.text },
  kind: { ...typography.subtitle, color: colors.text },
  meta: { ...typography.body, color: colors.muted },
});
