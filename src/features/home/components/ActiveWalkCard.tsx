import { Pressable, Text, View } from 'react-native';

import { formatWhen, petNamesOf, walkKindOf, WALK_STATUS_LABELS, walkStatusTone, type Walk } from '@/features/walks';
import { PLACE_ZOOM } from '@/shared/map/mapConfig';
import { WaggoMap } from '@/shared/map/WaggoMap';
import { StatusPill } from '@/shared/ui/StatusPill';
import { radius, shadows, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

type Props = { walk: Walk; pets: readonly { id: string; name: string }[]; onPress: () => void };

/**
 * The walk going on, on top of the owner's home (design proposal 07 · 7). The whole card is one button. On top, a
 * small OpenStreetMap map of the pickup without gestures: decorative (the text says it all) and it lets the taps
 * through to the card.
 */
export function ActiveWalkCard({ walk, pets, onPress }: Props) {
  const styles = useThemedStyles((colors) => ({
    card: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.card,
    },
    pressed: { opacity: 0.85 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    title: { ...typography.subtitle, color: colors.text },
    meta: { ...typography.caption, color: colors.muted },
    cta: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    ctaText: { ...typography.caption, fontWeight: '700', color: colors.primaryText },
  }));
  const names = petNamesOf(walk.petIds, pets);
  const pickup = { latitude: walk.latitude, longitude: walk.longitude };
  const status = WALK_STATUS_LABELS[walk.status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver paseo de ${names}: ${status}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View pointerEvents="none">
        <WaggoMap
          center={pickup}
          zoom={PLACE_ZOOM}
          markers={[{ id: 'pickup', kind: 'pickup', position: pickup, label: 'Recogida' }]}
          interactive={false}
          accessibilityLabel="Mapa de la recogida"
          height={120}
        />
      </View>
      <View style={styles.row}>
        <StatusPill label={status} tone={walkStatusTone(walk.status)} />
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{walk.status === 'InProgress' ? 'Ver en vivo' : 'Ver paseo'}</Text>
        </View>
      </View>
      <Text style={styles.title}>{names}</Text>
      <Text style={styles.meta}>{`${formatWhen(walk.scheduledFor)} · ${walkKindOf(walk)}`}</Text>
    </Pressable>
  );
}
