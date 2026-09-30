import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMyPets } from '@/features/pets';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { WalkRow } from '../components/WalkRow';
import { useMyWalks } from '../hooks/useWalks';

type Props = { onOpenWalk: (id: string) => void };

/** RF-007: the owner's walks, newest first. */
export function MyWalksScreen({ onOpenWalk }: Props) {
  const walks = useMyWalks();
  const pets = useMyPets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>HISTORIAL</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Mis paseos
        </Text>

        {walks.isPending && <ActivityIndicator accessibilityLabel="Cargando tus paseos" color={colors.primary} />}
        {walks.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar tus paseos. Intenta de nuevo.
          </Text>
        )}
        {walks.data?.length === 0 && <Text style={styles.empty}>Aún no has pedido paseos.</Text>}
        {walks.data && walks.data.length > 0 && (
          <View>
            {walks.data.map((walk) => (
              <WalkRow key={walk.id} walk={walk} pets={pets.data ?? []} onPress={() => onOpenWalk(walk.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: layout.column,
  content: { gap: spacing.md, padding: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  title: { ...typography.display, color: colors.text, marginBottom: spacing.md },
  error: { ...typography.body, color: colors.danger },
  empty: { ...typography.body, color: colors.muted },
});
