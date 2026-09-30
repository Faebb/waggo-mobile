import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMyPets } from '@/features/pets';
import { formatMoney } from '@/features/pricing';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { colors, layout, radius, spacing, typography } from '@/shared/ui/theme';

import { useCancelWalk, useWalk, WALK_POLL_INTERVAL_MS } from '../hooks/useWalks';
import { formatWhen, petNamesOf, walkKindOf } from '../model/describeWalk';
import { CANCELLABLE_STATUSES, WALK_STATUS_HEADLINES, type WalkStatus } from '../model/types';

type Props = { walkId: string; pollIntervalMs?: number };

/** RF-007: the walk after asking for it. Refreshes by itself until a walker accepts, like waiting for a ride. */
export function WalkStatusScreen({ walkId, pollIntervalMs = WALK_POLL_INTERVAL_MS }: Props) {
  const walk = useWalk(walkId, pollIntervalMs);
  const pets = useMyPets();
  const cancel = useCancelWalk(walkId);

  if (walk.isPending) {
    return <ActivityIndicator accessibilityLabel="Cargando el paseo" color={colors.primary} style={styles.loading} />;
  }
  // A failed refresh keeps showing the walk already loaded; only a first load failure shows the error.
  if (walk.isError && walk.data === undefined) {
    return (
      <Text accessibilityRole="alert" style={[styles.error, styles.loading]}>
        No pudimos cargar el paseo. Intenta de nuevo.
      </Text>
    );
  }

  const data = walk.data;
  const canCancel = CANCELLABLE_STATUSES.includes(data.status);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <StatusMark status={data.status} />
        <Text accessibilityRole="header" style={styles.headline}>
          {WALK_STATUS_HEADLINES[data.status]}
        </Text>

        <View>
          <Detail label="Perros" value={petNamesOf(data.petIds, pets.data ?? [])} />
          <Detail label="Paseo" value={walkKindOf(data)} />
          <Detail label="Cuándo" value={formatWhen(data.scheduledFor)} />
          <Detail label="Recogida" value={data.pickupAddress} />
          {data.notes !== null && <Detail label="Indicaciones" value={data.notes} />}
          <Detail label="Total" value={formatMoney(data.total, data.currency)} highlight />
        </View>

        {cancel.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cancelar el paseo. Intenta de nuevo.
          </Text>
        )}
      </ScrollView>

      {canCancel && (
        <ActionFooter>
          <Button
            label={cancel.isPending ? 'Cancelando…' : 'Cancelar paseo'}
            variant="secondary"
            onPress={() => cancel.mutate()}
            disabled={cancel.isPending}
          />
        </ActionFooter>
      )}
    </View>
  );
}

function Detail({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailHighlight]}>{value}</Text>
    </View>
  );
}

/** Yellow dot that pulses while the walk is looking for a walker. Decorative. */
function StatusMark({ status }: { status: WalkStatus }) {
  const [pulse] = useState(() => new Animated.Value(1));
  const searching = status === 'Requested';

  useEffect(() => {
    if (!searching) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, searching]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.mark, status === 'Cancelled' && styles.markOff, { opacity: pulse }]}
    />
  );
}

const styles = StyleSheet.create({
  screen: layout.column,
  loading: { margin: spacing.xl },
  content: { gap: spacing.lg, padding: spacing.lg },
  mark: { width: 20, height: 20, borderRadius: radius.pill, backgroundColor: colors.primary },
  markOff: { backgroundColor: colors.muted },
  headline: { ...typography.display, color: colors.text },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  detailLabel: { ...typography.body, color: colors.muted },
  detailValue: { ...typography.body, flexShrink: 1, color: colors.text, textAlign: 'right' },
  detailHighlight: { ...typography.subtitle, color: colors.primary },
  error: { ...typography.body, color: colors.danger },
});
