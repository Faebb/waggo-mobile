import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyPets } from '@/features/pets';
import { ACTIVE_STATUSES, useMyWalks, WalkRow } from '@/features/walks';
import { colors, layout, radius, spacing, typography } from '@/shared/ui/theme';

type Props = {
  onRequestWalk: () => void;
  onOpenPets: () => void;
  onOpenWalks: () => void;
  onOpenWalk: (id: string) => void;
};

/**
 * Owner home, inspired by a ride app: one big "where to?" entry to ask for a walk, the walk going on (if any)
 * and shortcuts to the owner's dogs and walks.
 */
export function HomeScreen({ onRequestWalk, onOpenPets, onOpenWalks, onOpenWalk }: Props) {
  const pets = useMyPets();
  const walks = useMyWalks();
  const activeWalk = walks.data?.find((walk) => ACTIVE_STATUSES.includes(walk.status));
  const petCount = pets.data?.length ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark} />
          <Text style={styles.brand}>Waggo</Text>
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

function Shortcut({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
    >
      <View style={styles.shortcutText}>
        <Text style={styles.shortcutTitle}>{title}</Text>
        <Text style={styles.shortcutDetail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  column: layout.column,
  content: { gap: spacing.xl, padding: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 16, height: 16, borderRadius: radius.sm, backgroundColor: colors.primary },
  brand: { ...typography.subtitle, color: colors.text },
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
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  shortcutText: { flex: 1, gap: 2 },
  shortcutTitle: { ...typography.subtitle, color: colors.text },
  shortcutDetail: { ...typography.caption, color: colors.muted },
  chevron: { ...typography.title, color: colors.muted },
});
