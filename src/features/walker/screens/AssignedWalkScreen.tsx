import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { PaymentSummary } from '@/features/payments';
import { formatMoney } from '@/features/pricing';
import { BEACON_INTERVAL_MS, useTrackingBeacon, WalkMap, WalkSafety } from '@/features/tracking';
import { formatWhen, useWalk, WALK_STATUS_LABELS, walkStatusTone, type WalkStatus } from '@/features/walks';
import { ApiError } from '@/shared/api/ApiError';
import { getDevicePosition, type DevicePosition } from '@/shared/location/devicePosition';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Banner } from '@/shared/ui/Banner';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { ChatIcon } from '@/shared/ui/icons/ChatIcon';
import { StatusPill } from '@/shared/ui/StatusPill';
import { layout, radius, shadows, sizes, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useWalkProgress } from '../hooks/useWalker';
import { offerKindOf } from '../model/describeOffer';

const HEADLINES: Record<WalkStatus, string> = {
  Requested: 'Paseo aceptado',
  Accepted: 'Paseo aceptado',
  InProgress: 'Paseo en curso',
  Completed: '¡Paseo terminado!',
  Cancelled: 'El dueño canceló el paseo',
};

/** Google Maps universal link: opens the maps app on the phone (or the web), at no cost for Waggo. */
function mapsUrlOf(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

type Props = {
  walkId: string;
  beaconIntervalMs?: number;
  onOpenChat?: () => void;
  /** "Ver más solicitudes" once the walk ended or the owner cancelled. */
  onSeeRequests?: () => void;
};

/**
 * RF-007/RF-008, walker side (design proposal 07 · 29–31): the exact pickup with "Abrir en Maps", the owner's
 * notes and the payout. The walker starts the walk when picking the dogs up, the phone shares its position while it
 * goes on, and finishing asks for confirmation. Ends with what the walker earned.
 *
 * The OpenStreetMap map (`WalkMap`) shows the pickup and, once the walker shares the position, the dashed straight
 * line to it (no directions service: the ETA is `nueva — requiere spec`); during the walk, the route and the zone.
 */
export function AssignedWalkScreen({
  walkId,
  beaconIntervalMs = BEACON_INTERVAL_MS,
  onOpenChat,
  onSeeRequests,
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
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    headline: { ...typography.title, color: colors.text },
    earned: { ...typography.display, color: colors.success },
    sharing: { ...typography.caption, fontWeight: '700', color: colors.success },
    chat: {
      width: sizes.touch,
      height: sizes.touch,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface2,
    },
    confirm: { gap: spacing.sm },
    footerHelp: { ...typography.caption, color: colors.muted, textAlign: 'center' },
  }));
  const walk = useWalk(walkId);
  const { start, finish } = useWalkProgress(walkId);
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(false);
  const inProgress = walk.data?.status === 'InProgress';
  useTrackingBeacon(walkId, inProgress, beaconIntervalMs);

  if (walk.isPending) {
    return <ActivityIndicator accessibilityLabel="Cargando el paseo" color={colors.primary} style={styles.loading} />;
  }
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
  const ended = data.status === 'Completed' || data.status === 'Cancelled';
  const payout = formatMoney(data.walkerPayout, data.currency);
  const finishError =
    finish.error instanceof ApiError
      ? finish.error.errors.map((error) => error.message).join('\n')
      : finish.isError
        ? 'No pudimos terminar el paseo. Intenta de nuevo.'
        : null;

  function openFinish() {
    finish.reset();
    setConfirmingFinish(true);
  }

  async function openInMaps(latitude: number, longitude: number) {
    try {
      await Linking.openURL(mapsUrlOf(latitude, longitude));
      setMapsFailed(false);
    } catch {
      setMapsFailed(true);
    }
  }

  async function showMyPosition() {
    setLocating(true);
    const found = await getDevicePosition();
    setLocating(false);
    setLocationDenied(found === null);
    setPosition(found);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {data.status !== 'Cancelled' && (
          <WalkMap
            walkId={data.id}
            status={data.status}
            viewer="Walker"
            pickup={{ latitude: data.latitude, longitude: data.longitude }}
            pickupAddress={data.pickupAddress}
            walkerPosition={position}
          />
        )}
        {data.status === 'Accepted' && position === null && (
          <Button
            label="Ver mi distancia a la recogida"
            loadingLabel="Buscando tu ubicación…"
            loading={locating}
            variant="tertiary"
            onPress={showMyPosition}
          />
        )}
        {locationDenied && (
          <Banner
            tone="warning"
            title="No tenemos acceso a tu ubicación."
            message="Actívala en Ajustes para ver tu distancia y compartir el recorrido."
            actionLabel="Abrir Ajustes"
            onAction={() => void Linking.openSettings()}
          />
        )}
        {inProgress && (
          <Banner
            tone="warning"
            message="Mantén Waggo abierta durante el paseo: si bloqueas el teléfono o cambias de app, dejamos de compartir tu ruta con el dueño."
          />
        )}
        {data.status === 'Cancelled' && (
          <Banner tone="warning" message="El dueño canceló este paseo. No tienes que ir a la recogida." />
        )}

        <View style={styles.sheet}>
          <View style={styles.statusRow}>
            <StatusPill label={WALK_STATUS_LABELS[data.status]} tone={walkStatusTone(data.status)} />
            {onOpenChat && data.status !== 'Cancelled' && (
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
          <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.headline}>
            {HEADLINES[data.status]}
          </Text>
          {data.status === 'Completed' && <Text style={styles.earned}>{`Ganaste ${payout}`}</Text>}
          {inProgress && <Text style={styles.sharing}>Compartiendo tu ubicación con el dueño</Text>}
          {data.status === 'Accepted' && (
            <Button
              label="Abrir en Maps"
              variant="secondary"
              onPress={() => void openInMaps(data.latitude, data.longitude)}
            />
          )}
          {data.status === 'Accepted' && mapsFailed && (
            <Banner
              tone="warning"
              message="No pudimos abrir Maps. Busca la dirección de la recogida en tu app de mapas."
            />
          )}
          {(data.status === 'Accepted' || data.status === 'InProgress') && (
            <WalkSafety walkId={data.id} viewer="Walker" onOpenChat={onOpenChat} />
          )}
        </View>

        <View>
          <DetailRow label="Recogida" value={data.pickupAddress} />
          <DetailRow label="Cuándo" value={formatWhen(data.scheduledFor)} />
          <DetailRow label="Paseo" value={offerKindOf({ ...data, petCount: data.petIds.length })} />
          {data.notes !== null && <DetailRow label="Indicaciones" value={data.notes} />}
          <DetailRow label="Ganas" value={payout} highlight />
          <PaymentSummary walkId={data.id} walkStatus={data.status} viewer="Walker" />
        </View>

        {start.isError && <Banner tone="danger" message="No pudimos iniciar el paseo. Intenta de nuevo." />}
      </ScrollView>

      {data.status === 'Accepted' && (
        <ActionFooter>
          <Button
            label="Iniciar paseo"
            loadingLabel="Iniciando…"
            loading={start.isPending}
            onPress={() => start.mutate()}
          />
        </ActionFooter>
      )}
      {inProgress && (
        <ActionFooter>
          <Button label="Terminar paseo" onPress={openFinish} />
          <Text style={styles.footerHelp}>Tócalo al entregar a los perros en la recogida.</Text>
        </ActionFooter>
      )}
      <BottomSheet
        visible={confirmingFinish && inProgress}
        title="¿Terminar el paseo?"
        message={`Confirma que entregaste a los perros en ${data.pickupAddress}. Al terminar se cobra el pago y recibes ${payout}.`}
        onClose={() => setConfirmingFinish(false)}
        dismissible={!finish.isPending}
      >
        {finishError !== null && <Banner tone="danger" message={finishError} />}
        <View style={styles.confirm}>
          <Button
            label="Sí, terminar paseo"
            loadingLabel="Terminando…"
            loading={finish.isPending}
            onPress={() => finish.mutate(undefined, { onSuccess: () => setConfirmingFinish(false) })}
          />
          <Button
            label="Seguir paseando"
            variant="secondary"
            disabled={finish.isPending}
            onPress={() => setConfirmingFinish(false)}
          />
        </View>
      </BottomSheet>
      {ended && onSeeRequests !== undefined && (
        <ActionFooter>
          <Button label="Ver más solicitudes" onPress={onSeeRequests} />
        </ActionFooter>
      )}
    </View>
  );
}
