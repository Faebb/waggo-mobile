import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminLink } from '@/features/admin';
import { NotificationBell } from '@/features/notifications';
import { useMyPets } from '@/features/pets';
import { ACTIVE_STATUSES, useMyWalks, WalkRow } from '@/features/walks';
import { BrandMark } from '@/shared/ui/BrandMark';
import { Shortcut } from '@/shared/ui/Shortcut';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

type Props = {
  onRequestWalk: () => void;
  onOpenPets: () => void;
  onOpenWalks: () => void;
  onOpenWalk: (id: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  /** Only given when the signed-in user is an admin (ADR-017); shows the verification queue link. */
  onOpenAdmin?: () => void;
};

/**
 * Owner home, inspired by a ride app: one big "where to?" entry to ask for a walk, the walk going on (if any)
 * and shortcuts to the owner's dogs, walks and profile.
 */
export function HomeScreen({
  onRequestWalk,
  onOpenPets,
  onOpenWalks,
  onOpenWalk,
  onOpenNotifications,
  onOpenProfile,
  onOpenAdmin,
}: Props) {
  const styles = useThemedStyles((colors) => ({
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    topBarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.xl, padding: spacing.lg },
    ask: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    askText: { flex: 1, gap: spacing.xs },
    askTitle: { ...typography.title, color: colors.text },
    askSubtitle: { ...typography.body, color: colors.muted },
    arrow: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    arrowText: { ...typography.title, color: colors.primaryText },
    pressed: { opacity: 0.85 },
    section: { gap: spacing.sm },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
  }));
  const pets = useMyPets();
  const walks = useMyWalks();
  const activeWalk = walks.data?.find((walk) => ACTIVE_STATUSES.includes(walk.status));
  const petCount = pets.data?.length ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <View style={styles.topBar}>
          <BrandMark />
          <View style={styles.topBarActions}>
            {onOpenAdmin !== undefined && <AdminLink onPress={onOpenAdmin} />}
            <NotificationBell onPress={onOpenNotifications} />
          </View>
        </View>

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
            <Text style={styles.arrowText}>→</Text>
          </View>
        </Pressable>

        {activeWalk && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>AHORA</Text>
            <WalkRow walk={activeWalk} pets={pets.data ?? []} onPress={() => onOpenWalk(activeWalk.id)} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.eyebrow}>TU CUENTA</Text>
          <Shortcut title="Configuración" detail="Tus datos y tu cuenta" onPress={onOpenProfile} />
          <Shortcut
            title="Mis perros"
            detail={petCount === 1 ? '1 perro' : `${petCount} perros`}
            onPress={onOpenPets}
          />
          <Shortcut title="Mis paseos" detail="Historial y paseos programados" onPress={onOpenWalks} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
