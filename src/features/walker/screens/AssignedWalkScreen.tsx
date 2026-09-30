import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/features/pricing';
import { BEACON_INTERVAL_MS, useTrackingBeacon, WalkRoute, WalkSafety } from '@/features/tracking';
import { formatWhen, useWalk, type WalkStatus } from '@/features/walks';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { useWalkProgress } from '../hooks/useWalker';
import { offerKindOf } from '../model/describeOffer';

const HEADLINES: Record<WalkStatus, string> = {
  Requested: 'Paseo aceptado',
  Accepted: 'Paseo aceptado',
  InProgress: 'Paseo en curso',
  Completed: 'Paseo terminado',
  Cancelled: 'El dueño canceló el paseo',
};

type Props = { walkId: string; beaconIntervalMs?: number };

/**
 * RF-007/RF-008, walker side: a walk the walker accepted, with the exact pickup and the owner's notes. The walker
 * starts it when picking the dogs up, the phone shares its position while it goes on, and finishes it at the end.
 */
export function AssignedWalkScreen({ walkId, beaconIntervalMs = BEACON_INTERVAL_MS }: Props) {
  const walk = useWalk(walkId);
  const { start, finish } = useWalkProgress(walkId);
  const inProgress = walk.data?.status === 'InProgress';
  useTrackingBeacon(walkId, inProgress, beaconIntervalMs);

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
  const progressFailed = start.isError || finish.isError;
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MODO PASEADOR</Text>
        <Text accessibilityRole="header" style={styles.headline}>
          {HEADLINES[data.status]}
        </Text>
        {inProgress && <Text style={styles.sharing}>Compartiendo tu ubicación con el dueño</Text>}

        {(data.status === 'InProgress' || data.status === 'Completed') && (
          <WalkRoute walkId={data.id} live={inProgress} />
        )}

        {(data.status === 'Accepted' || data.status === 'InProgress') && (
          <WalkSafety walkId={data.id} viewer="Walker" />
        )}

        <View>
          <DetailRow label="Recogida" value={data.pickupAddress} />
          <DetailRow label="Cuándo" value={formatWhen(data.scheduledFor)} />
          <DetailRow label="Paseo" value={offerKindOf({ ...data, petCount: data.petIds.length })} />
          {data.notes !== null && <DetailRow label="Indicaciones" value={data.notes} />}
          <DetailRow label="Ganas" value={formatMoney(data.walkerPayout, data.currency)} highlight />
        </View>

        {progressFailed && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos actualizar el paseo. Intenta de nuevo.
          </Text>
        )}
      </ScrollView>

      {data.status === 'Accepted' && (
        <ActionFooter>
          <Button
            label={start.isPending ? 'Iniciando…' : 'Iniciar paseo'}
            onPress={() => start.mutate()}
            disabled={start.isPending}
          />
        </ActionFooter>
      )}
      {inProgress && (
        <ActionFooter>
          <Button
            label={finish.isPending ? 'Terminando…' : 'Terminar paseo'}
            onPress={() => finish.mutate()}
            disabled={finish.isPending}
          />
        </ActionFooter>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: layout.column,
  loading: { margin: spacing.xl },
  content: { gap: spacing.lg, padding: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  headline: { ...typography.display, color: colors.text },
  sharing: { ...typography.caption, fontWeight: '700', color: colors.primary },
  error: { ...typography.body, color: colors.danger },
});
