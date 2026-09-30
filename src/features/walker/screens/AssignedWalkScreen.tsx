import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { formatWhen, useWalk, type WalkStatus } from '@/features/walks';
import { DetailRow } from '@/shared/ui/DetailRow';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { offerKindOf } from '../model/describeOffer';

const HEADLINES: Record<WalkStatus, string> = {
  Requested: 'Paseo aceptado',
  Accepted: 'Paseo aceptado',
  InProgress: 'Paseo en curso',
  Completed: 'Paseo terminado',
  Cancelled: 'El dueño canceló el paseo',
};

type Props = { walkId: string };

/** RF-007, walker side: a walk the walker accepted, with the exact pickup and the owner's notes. */
export function AssignedWalkScreen({ walkId }: Props) {
  const walk = useWalk(walkId);

  if (walk.isPending) {
    return <ActivityIndicator accessibilityLabel="Cargando el paseo" color={colors.primary} style={styles.loading} />;
  }
  if (walk.isError && walk.data === undefined) {
    return (
      <Text accessibilityRole="alert" style={[styles.error, styles.loading]}>
        No pudimos cargar el paseo. Intenta de nuevo.
      </Text>
    );
  }

  const data = walk.data;
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MODO PASEADOR</Text>
        <Text accessibilityRole="header" style={styles.headline}>
          {HEADLINES[data.status]}
        </Text>

        <View>
          <DetailRow label="Recogida" value={data.pickupAddress} />
          <DetailRow label="Cuándo" value={formatWhen(data.scheduledFor)} />
          <DetailRow label="Paseo" value={offerKindOf({ ...data, petCount: data.petIds.length })} />
          {data.notes !== null && <DetailRow label="Indicaciones" value={data.notes} />}
          <DetailRow label="Ganas" value={formatMoney(data.walkerPayout, data.currency)} highlight />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: layout.column,
  loading: { margin: spacing.xl },
  content: { gap: spacing.lg, padding: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  headline: { ...typography.display, color: colors.text },
  error: { ...typography.body, color: colors.danger },
});
