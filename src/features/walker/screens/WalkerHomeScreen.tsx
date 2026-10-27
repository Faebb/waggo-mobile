import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationBell } from '@/features/notifications';
import { formatMoney } from '@/features/pricing';
import { formatWhen, WALK_STATUS_LABELS, walkStatusTone } from '@/features/walks';
import { ApiError } from '@/shared/api/ApiError';
import { getCurrentLocation, type Coordinates } from '@/shared/location/getCurrentLocation';
import { blockCenterOf } from '@/shared/map/geo';
import { COUNTRY_ZOOM, DEFAULT_CENTER } from '@/shared/map/mapConfig';
import type { MapMarker } from '@/shared/map/types';
import { WaggoMap } from '@/shared/map/WaggoMap';
import { Banner } from '@/shared/ui/Banner';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusPill } from '@/shared/ui/StatusPill';
import { layout, radius, shadows, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { OfferCard } from '../components/OfferCard';
import { useAcceptWalk, useAssignedWalks, useAvailableWalks } from '../hooks/useWalker';

/** Zoom around the walker once the location is shared: a few blocks, enough for the 5 km of requests nearby. */
const NEARBY_ZOOM = 13;

type Props = { onOpenAssigned: (id: string) => void; onOpenNotifications: () => void };

/**
 * RF-007, walker side (design proposal 07 · 28): open requests with what they earn, accepted with one tap; the
 * nearest first once the walker shares the location. The walk under way, if any, is on top. Accepted walks and
 * earnings live in their own tabs (ADR-019 as amended).
 *
 * Above the list, the OpenStreetMap map with a price pill per request, drawn at the center of its block (not the
 * exact house, design 07 · 28) and the walker's position once shared. Tapping a pill brings its card to the top.
 */
export function WalkerHomeScreen({ onOpenAssigned, onOpenNotifications }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
    header: { flex: 1, gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
    current: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
      ...shadows.card,
    },
    pressed: { opacity: 0.85 },
    currentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
    currentAddress: { ...typography.subtitle, color: colors.text },
    currentMeta: { ...typography.caption, color: colors.muted },
    currentPayout: { ...typography.body, fontWeight: '700', color: colors.primary },
  }));
  const [near, setNear] = useState<Coordinates | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [takenIds, setTakenIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const available = useAvailableWalks(near);
  const assigned = useAssignedWalks();
  const accept = useAcceptWalk();
  const current =
    assigned.data?.find((walk) => walk.status === 'InProgress') ??
    assigned.data?.find((walk) => walk.status === 'Accepted');

  async function locate() {
    const coordinates = await getCurrentLocation();
    setLocationDenied(coordinates === null);
    setNear(coordinates);
  }

  function acceptOffer(id: string) {
    accept.mutate(id, {
      onSuccess: (walk) => onOpenAssigned(walk.id),
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) setTakenIds((ids) => [...ids, id]);
      },
    });
  }

  const offers = available.data ?? [];
  const markers: MapMarker[] = offers.map((offer) => ({
    id: offer.id,
    kind: 'offer',
    position: blockCenterOf(offer),
    text: formatMoney(offer.walkerPayout, offer.currency),
    selected: offer.id === selectedId,
    label: `Solicitud: ganas ${formatMoney(offer.walkerPayout, offer.currency)}, ${formatWhen(offer.scheduledFor)}`,
  }));
  if (near !== null) markers.push({ id: 'me', kind: 'walker', position: near, text: 'Tú', label: 'Tu ubicación' });
  const sortedOffers = [...offers].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId));
  const mapLabel =
    offers.length === 0
      ? 'Mapa de solicitudes: no hay solicitudes por ahora.'
      : `Mapa con ${offers.length} ${offers.length === 1 ? 'solicitud' : 'solicitudes'}. La lista de abajo tiene el detalle.`;

  const acceptError =
    accept.error instanceof ApiError
      ? accept.error.errors.map((error) => error.message).join('\n')
      : accept.isError
        ? 'No pudimos aceptar el paseo. Intenta de nuevo.'
        : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <View style={styles.topBar}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MODO PASEADOR</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Solicitudes
            </Text>
          </View>
          <NotificationBell onPress={onOpenNotifications} />
        </View>

        {current !== undefined && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tu paseo: ${current.pickupAddress}, ${WALK_STATUS_LABELS[current.status]}`}
            onPress={() => onOpenAssigned(current.id)}
            style={({ pressed }) => [styles.current, pressed && styles.pressed]}
          >
            <View style={styles.currentRow}>
              <StatusPill label={WALK_STATUS_LABELS[current.status]} tone={walkStatusTone(current.status)} />
              <Text style={styles.currentPayout}>{formatMoney(current.walkerPayout, current.currency)}</Text>
            </View>
            <Text style={styles.currentAddress}>{current.pickupAddress}</Text>
            <Text style={styles.currentMeta}>{formatWhen(current.scheduledFor)}</Text>
          </Pressable>
        )}

        {near === null && !locationDenied && (
          <Banner
            tone="info"
            title="Comparte tu ubicación"
            message="Así ves primero las solicitudes más cercanas."
            actionLabel="Ver las más cercanas"
            onAction={locate}
          />
        )}
        {near !== null && (
          <Banner
            tone="success"
            message="Ordenadas por cercanía."
            actionLabel="Actualizar mi ubicación"
            onAction={locate}
          />
        )}
        {locationDenied && (
          <Banner
            tone="warning"
            title="No tenemos acceso a tu ubicación."
            message="Mostramos las solicitudes por hora, sin distancias. Revisa el permiso e intenta de nuevo."
            actionLabel="Intentar de nuevo"
            onAction={locate}
          />
        )}
        {acceptError !== null && <Banner tone="danger" message={acceptError} />}

        {available.data !== undefined && (
          <WaggoMap
            center={near ?? DEFAULT_CENTER}
            zoom={near ? NEARBY_ZOOM : COUNTRY_ZOOM}
            fitTo={markers.map((marker) => marker.position)}
            markers={markers}
            onMarkerPress={(id) => setSelectedId(id === 'me' ? null : id)}
            accessibilityLabel={mapLabel}
            height={220}
            failureMessage="Las solicitudes siguen en la lista de abajo."
          />
        )}

        {available.isPending && <ActivityIndicator accessibilityLabel="Buscando solicitudes" color={colors.primary} />}
        {available.isError && available.data === undefined && (
          <ErrorState message="No pudimos cargar las solicitudes." onRetry={() => void available.refetch()} />
        )}
        {available.isError && available.data !== undefined && (
          <Banner tone="warning" message="No pudimos actualizar las solicitudes. Mostramos lo último que recibimos." />
        )}
        {available.data?.length === 0 && (
          <EmptyState
            title="No hay solicitudes cerca por ahora"
            message="Te avisamos cuando llegue una. La lista se actualiza sola."
          />
        )}
        {sortedOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            taken={takenIds.includes(offer.id)}
            accepting={accept.isPending && accept.variables === offer.id}
            onAccept={() => acceptOffer(offer.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
