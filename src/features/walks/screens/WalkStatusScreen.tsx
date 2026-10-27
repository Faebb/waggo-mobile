import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, View } from 'react-native';

import { PaymentSummary } from '@/features/payments';
import { useMyPets } from '@/features/pets';
import { formatMoney } from '@/features/pricing';
import { WalkMap, WalkSafety } from '@/features/tracking';
import { ApiError } from '@/shared/api/ApiError';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Avatar } from '@/shared/ui/Avatar';
import { Banner } from '@/shared/ui/Banner';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { ChatIcon } from '@/shared/ui/icons/ChatIcon';
import { ShieldCheckIcon } from '@/shared/ui/icons/ShieldCheckIcon';
import { StatusPill } from '@/shared/ui/StatusPill';
import { layout, radius, shadows, sizes, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useCancelWalk, useWalk, WALK_POLL_INTERVAL_MS } from '../hooks/useWalks';
import { formatWhen, petNamesOf, walkKindOf } from '../model/describeWalk';
import { CANCELLABLE_STATUSES, WALK_STATUS_HEADLINES, WALK_STATUS_LABELS, type Walk } from '../model/types';
import { walkStatusTone } from '../model/walkStatusTone';

type Props = {
  walkId: string;
  pollIntervalMs?: number;
  onOpenChat?: () => void;
  /** "Pedir otro paseo" once the walk ended or was cancelled. */
  onRequestAgain?: () => void;
};

/** One sentence under the headline, per status (design proposal 07 · 14–18). */
const STATUS_LEADS: Record<Walk['status'], string> = {
  Requested: 'Te avisamos apenas alguien acepte.',
  Accepted: 'Va camino a la recogida.',
  InProgress: 'Sigue el recorrido en vivo.',
  Completed: 'El paseo terminó bien.',
  Cancelled: 'Liberamos el dinero retenido: no se cobró nada.',
};

/**
 * RF-007/RF-008/RF-011: the walk after asking for it, like waiting for a ride (design proposal 07 · 14–18). The
 * top is the OpenStreetMap map (`WalkMap`: pickup while waiting, live route with the dog and the agreed zone,
 * whole route at the end) and the card below plays the bottom sheet: status, walker, safety, details and payment.
 * It refreshes by itself while the walk is going on; status changes are announced.
 */
export function WalkStatusScreen({
  walkId,
  pollIntervalMs = WALK_POLL_INTERVAL_MS,
  onOpenChat,
  onRequestAgain,
}: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    loading: { margin: spacing.xl },
    content: { gap: spacing.lg, padding: spacing.lg },
    sheet: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      ...shadows.sheet,
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    headline: { ...typography.title, color: colors.text },
    lead: { ...typography.body, color: colors.muted },
    walker: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    walkerText: { flex: 1, gap: spacing.xs },
    walkerName: { ...typography.subtitle, color: colors.text },
    verified: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    verifiedText: { ...typography.caption, fontWeight: '700', color: colors.secondary },
    chat: {
      width: sizes.touch,
      height: sizes.touch,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface2,
    },
    confirm: { gap: spacing.sm },
  }));
  const walk = useWalk(walkId, pollIntervalMs);
  const pets = useMyPets();
  const cancel = useCancelWalk(walkId);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (walk.isPending) {
    return <ActivityIndicator accessibilityLabel="Cargando el paseo" color={colors.primary} style={styles.loading} />;
  }
  // A failed refresh keeps showing the walk already loaded; only a first load failure shows the error.
  if (walk.isError && walk.data === undefined) {
    return (
      <View style={styles.content}>
        <Banner
          tone="danger"
          message="No pudimos cargar el paseo."
          actionLabel="Intentar de nuevo"
          onAction={() => void walk.refetch()}
        />
      </View>
    );
  }

  const data = walk.data;
  const names = petNamesOf(data.petIds, pets.data ?? []);
  const canCancel = CANCELLABLE_STATUSES.includes(data.status);
  const ended = data.status === 'Completed' || data.status === 'Cancelled';
  const hasWalker = data.walkerId !== null && data.status !== 'Cancelled';
  const cancelError =
    cancel.error instanceof ApiError
      ? cancel.error.errors.map((error) => error.message).join('\n')
      : cancel.isError
        ? 'No pudimos cancelar el paseo. Intenta de nuevo.'
        : null;

  function openCancel() {
    cancel.reset();
    setConfirmingCancel(true);
  }

  const headline =
    data.status === 'Completed'
      ? `${names} ${data.petIds.length > 1 ? 'volvieron' : 'volvió'} a casa`
      : WALK_STATUS_HEADLINES[data.status];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <WalkMap
          walkId={data.id}
          status={data.status}
          viewer="Owner"
          pickup={{ latitude: data.latitude, longitude: data.longitude }}
          pickupAddress={data.pickupAddress}
          petNames={names}
        />

        {walk.isError && (
          <Banner tone="warning" message="No pudimos actualizar el paseo. Mostramos lo último que recibimos." />
        )}

        <View style={styles.sheet}>
          <View style={styles.statusRow}>
            {data.status === 'Requested' && <SearchingDot />}
            <StatusPill label={WALK_STATUS_LABELS[data.status]} tone={walkStatusTone(data.status)} />
          </View>
          <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.headline}>
            {headline}
          </Text>
          <Text style={styles.lead}>{STATUS_LEADS[data.status]}</Text>

          {hasWalker && (
            <View style={styles.walker}>
              <Avatar label="Paseador" size={48} />
              <View style={styles.walkerText}>
                <Text style={styles.walkerName}>Tu paseador</Text>
                <View style={styles.verified}>
                  <ShieldCheckIcon color={colors.secondary} size={16} />
                  <Text style={styles.verifiedText}>Paseador verificado</Text>
                </View>
              </View>
              {onOpenChat && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mensajes"
                  onPress={onOpenChat}
                  style={styles.chat}
                >
                  <ChatIcon color={colors.primary} size={22} />
                </Pressable>
              )}
            </View>
          )}

          {(data.status === 'Accepted' || data.status === 'InProgress') && (
            <WalkSafety walkId={data.id} viewer="Owner" onOpenChat={onOpenChat} />
          )}
        </View>

        <View>
          <DetailRow label="Perros" value={names} />
          <DetailRow label="Paseo" value={walkKindOf(data)} />
          <DetailRow label="Cuándo" value={formatWhen(data.scheduledFor)} />
          <DetailRow label="Recogida" value={data.pickupAddress} />
          {data.notes !== null && <DetailRow label="Indicaciones" value={data.notes} />}
          {data.startedAt !== null && <DetailRow label="Recogido" value={formatWhen(data.startedAt)} />}
          {data.finishedAt !== null && <DetailRow label="Entregado" value={formatWhen(data.finishedAt)} />}
          <DetailRow label="Total" value={formatMoney(data.total, data.currency)} highlight />
          <PaymentSummary walkId={data.id} walkStatus={data.status} viewer="Owner" />
        </View>
      </ScrollView>

      {canCancel && (
        <ActionFooter>
          <Button label="Cancelar paseo" variant="secondary" onPress={openCancel} />
        </ActionFooter>
      )}
      <BottomSheet
        visible={confirmingCancel && canCancel}
        title="¿Cancelar el paseo?"
        message={`Liberamos los ${formatMoney(data.total, data.currency)} retenidos.`}
        onClose={() => setConfirmingCancel(false)}
        dismissible={!cancel.isPending}
      >
        {cancelError !== null && <Banner tone="danger" message={cancelError} />}
        <View style={styles.confirm}>
          <Button
            label="Sí, cancelar paseo"
            loadingLabel="Cancelando…"
            loading={cancel.isPending}
            onPress={() => cancel.mutate(undefined, { onSuccess: () => setConfirmingCancel(false) })}
          />
          <Button
            label={data.status === 'Requested' ? 'No, seguir buscando' : 'No, mantener el paseo'}
            variant="secondary"
            disabled={cancel.isPending}
            onPress={() => setConfirmingCancel(false)}
          />
        </View>
      </BottomSheet>
      {ended && onRequestAgain !== undefined && (
        <ActionFooter>
          <Button
            label={data.status === 'Completed' ? 'Pedir otro paseo' : 'Pedir de nuevo'}
            onPress={onRequestAgain}
          />
        </ActionFooter>
      )}
    </View>
  );
}

/** Pulsing dot while looking for a walker (design proposal 03, `StatusPill` "Buscando"). Decorative. */
function SearchingDot() {
  const styles = useThemedStyles((colors) => ({
    dot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.primary },
  }));
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.dot, { opacity: pulse }]}
    />
  );
}
