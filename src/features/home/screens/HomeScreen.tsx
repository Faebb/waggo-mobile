import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminLink } from '@/features/admin';
import { NotificationBell } from '@/features/notifications';
import { VALUE_PILLARS, ValueCard } from '@/features/onboarding';
import { useMyPets } from '@/features/pets';
import { useMyProfile } from '@/features/profile';
import { ACTIVE_STATUSES, useMyWalks, WalkRow } from '@/features/walks';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PawIcon } from '@/shared/ui/icons/PawIcon';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { ActiveWalkCard } from '../components/ActiveWalkCard';

type Props = {
  onRequestWalk: () => void;
  onAddPet: () => void;
  onOpenWalk: (id: string) => void;
  onOpenNotifications: () => void;
  /** Only given when the signed-in user is an admin (ADR-017); shows the verification queue link. */
  onOpenAdmin?: () => void;
};

/**
 * Owner home (design proposal 07 · 7), like a ride app: a greeting, the walk going on (if any), one big "who goes
 * out today?" entry and the walks still to come. On first use it asks for the dog first. Dogs, walks and settings
 * live in the tab bar (ADR-019).
 */
export function HomeScreen({ onRequestWalk, onAddPet, onOpenWalk, onOpenNotifications, onOpenAdmin }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
    greeting: { ...typography.title, flex: 1, color: colors.text },
    topBarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    ask: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
    },
    pressed: { opacity: 0.85 },
    askText: { flex: 1, gap: spacing.xs },
    askTitle: { ...typography.title, color: colors.primaryText },
    askSubtitle: { ...typography.caption, color: colors.primaryText },
    arrow: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryText,
    },
    arrowText: { ...typography.title, color: colors.primary },
    firstDog: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface2 },
    firstDogTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    firstDogTitle: { ...typography.subtitle, flex: 1, color: colors.text },
    firstDogText: { ...typography.body, color: colors.muted },
    section: { gap: spacing.sm },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
  }));
  const profile = useMyProfile();
  const pets = useMyPets();
  const walks = useMyWalks();
  const activeWalks = walks.data?.filter((walk) => ACTIVE_STATUSES.includes(walk.status)) ?? [];
  // The walk already on its way or going on comes first; the rest are "Próximos".
  const current =
    activeWalks.find((walk) => walk.status === 'InProgress') ??
    activeWalks.find((walk) => walk.status === 'Accepted') ??
    activeWalks[0];
  const upcoming = activeWalks.filter((walk) => walk !== current);
  const firstName = profile.data?.fullName?.trim().split(/\s+/)[0];
  const hasNoDogs = pets.isSuccess && pets.data.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <View style={styles.topBar}>
          <Text accessibilityRole="header" style={styles.greeting}>
            {firstName ? `Hola, ${firstName}` : 'Hola'}
          </Text>
          <View style={styles.topBarActions}>
            {onOpenAdmin !== undefined && <AdminLink onPress={onOpenAdmin} />}
            <NotificationBell onPress={onOpenNotifications} />
          </View>
        </View>

        {walks.isPending && <Skeleton width="100%" height={120} radius={radius.md} />}
        {walks.isError && <ErrorState message="No pudimos cargar tus paseos." onRetry={() => void walks.refetch()} />}
        {current !== undefined && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>AHORA</Text>
            <ActiveWalkCard walk={current} pets={pets.data ?? []} onPress={() => onOpenWalk(current.id)} />
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="¿Quién sale a pasear hoy?"
          onPress={onRequestWalk}
          style={({ pressed }) => [styles.ask, pressed && styles.pressed]}
        >
          <View style={styles.askText}>
            <Text style={styles.askTitle}>¿Quién sale a pasear hoy?</Text>
            <Text style={styles.askSubtitle}>Elige a tus perros, la hora y listo.</Text>
          </View>
          <View style={styles.arrow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={styles.arrowText}>›</Text>
          </View>
        </Pressable>

        {hasNoDogs && (
          <>
            <View style={styles.firstDog}>
              <View style={styles.firstDogTitleRow}>
                <PawIcon color={colors.primary} size={24} />
                <Text style={styles.firstDogTitle}>Primero, cuéntanos de tu perro</Text>
              </View>
              <Text style={styles.firstDogText}>
                Lo registras una vez y lo eliges en segundos cada vez que pidas un paseo.
              </Text>
              <Button label="Agregar mi perro" onPress={onAddPet} />
            </View>
            <View style={styles.section}>
              <Text style={styles.eyebrow}>ASÍ FUNCIONA</Text>
              {VALUE_PILLARS.map((pillar, index) => (
                <ValueCard key={pillar.title} index={index} pillar={pillar} />
              ))}
            </View>
          </>
        )}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>PRÓXIMOS</Text>
            {upcoming.map((walk) => (
              <WalkRow key={walk.id} walk={walk} pets={pets.data ?? []} onPress={() => onOpenWalk(walk.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
