import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMoney } from '@/features/pricing';
import { formatWhen } from '@/features/walks';
import { ApiError } from '@/shared/api/ApiError';
import { getCurrentLocation, type Coordinates } from '@/shared/location/getCurrentLocation';
import { BrandMark } from '@/shared/ui/BrandMark';
import { Button } from '@/shared/ui/Button';
import { colors, layout, radius, spacing, typography } from '@/shared/ui/theme';

import { OfferCard } from '../components/OfferCard';
import { useAcceptWalk, useAssignedWalks, useAvailableWalks } from '../hooks/useWalker';

type Props = { onOpenAssigned: (id: string) => void };

/**
 * RF-007, walker side: open requests (the nearest first once the walker shares the location) with what they earn,
 * accepted with one tap; below, the walks already accepted.
 */
export function WalkerHomeScreen({ onOpenAssigned }: Props) {
  const [near, setNear] = useState<Coordinates | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const available = useAvailableWalks(near);
  const assigned = useAssignedWalks();
  const accept = useAcceptWalk();

  async function locate() {
    const coordinates = await getCurrentLocation();
    setLocationDenied(coordinates === null);
    setNear(coordinates);
  }

  const acceptError =
    accept.error instanceof ApiError
      ? accept.error.errors.map((error) => error.message).join('\n')
      : accept.isError
        ? 'No pudimos aceptar el paseo. Intenta de nuevo.'
        : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <BrandMark />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MODO PASEADOR</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Solicitudes
          </Text>
        </View>

        <Button
          label={near ? 'Actualizar mi ubicación' : 'Ver las más cercanas'}
          variant="secondary"
          onPress={locate}
        />
        {locationDenied && (
          <Text style={styles.error}>
            No pudimos obtener tu ubicación. Revisa el permiso de ubicación e intenta de nuevo.
          </Text>
        )}
        {acceptError !== null && (
          <Text accessibilityRole="alert" style={styles.error}>
            {acceptError}
          </Text>
        )}

        {available.isPending && <ActivityIndicator accessibilityLabel="Buscando solicitudes" color={colors.primary} />}
        {available.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar las solicitudes. Intenta de nuevo.
          </Text>
        )}
        {available.data?.length === 0 && <Text style={styles.empty}>No hay solicitudes por ahora.</Text>}
        {available.data?.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            accepting={accept.isPending && accept.variables === offer.id}
            onAccept={() => accept.mutate(offer.id, { onSuccess: (walk) => onOpenAssigned(walk.id) })}
          />
        ))}

        {assigned.data && assigned.data.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>TUS PASEOS</Text>
            {assigned.data.map((walk) => (
              <Pressable
                key={walk.id}
                accessibilityRole="button"
                onPress={() => onOpenAssigned(walk.id)}
                style={({ pressed }) => [styles.assigned, pressed && styles.pressed]}
              >
                <View style={styles.assignedText}>
                  <Text style={styles.assignedAddress}>{walk.pickupAddress}</Text>
                  <Text style={styles.assignedMeta}>{formatWhen(walk.scheduledFor)}</Text>
                </View>
                <Text style={styles.assignedPayout}>{formatMoney(walk.walkerPayout, walk.currency)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  column: layout.column,
  content: { gap: spacing.lg, padding: spacing.lg },
  header: { gap: spacing.xs },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  title: { ...typography.display, color: colors.text },
  error: { ...typography.body, color: colors.danger },
  empty: { ...typography.body, color: colors.muted },
  section: { gap: spacing.sm, marginTop: spacing.md },
  assigned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  assignedText: { flex: 1, gap: 2 },
  assignedAddress: { ...typography.subtitle, color: colors.text },
  assignedMeta: { ...typography.caption, color: colors.muted },
  assignedPayout: { ...typography.body, fontWeight: '700', color: colors.primary },
  pressed: { opacity: 0.85, borderRadius: radius.sm },
});
