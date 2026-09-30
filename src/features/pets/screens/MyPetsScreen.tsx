import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { colors, spacing, typography } from '@/shared/ui/theme';

import { PetRow } from '../components/PetRow';
import { useMyPets } from '../hooks/usePets';

type Props = { onAddPress: () => void };

/** RF-004: the owner sees their dogs and can add a new one. */
export function MyPetsScreen({ onAddPress }: Props) {
  const { data: pets, isPending, isError } = useMyPets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TUS PERROS</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Mis perros
        </Text>

        {isPending && <ActivityIndicator accessibilityLabel="Cargando tus perros" color={colors.primary} />}
        {isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar tus perros. Intenta de nuevo.
          </Text>
        )}
        {pets?.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aún no registras perros.</Text>
            <Text style={styles.emptyText}>Agrégalos una vez y pide paseos en segundos.</Text>
          </View>
        )}
        {pets && pets.length > 0 && (
          <View>
            {pets.map((pet) => (
              <PetRow key={pet.id} pet={pet} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Agregar perro" onPress={onAddPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Mobile first: on tablets and web the content keeps a phone-width column.
  screen: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
  content: { gap: spacing.md, padding: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  title: { ...typography.display, color: colors.text, marginBottom: spacing.md },
  error: { ...typography.body, color: colors.danger },
  empty: { gap: spacing.xs, paddingVertical: spacing.lg },
  emptyTitle: { ...typography.subtitle, color: colors.text },
  emptyText: { ...typography.body, color: colors.muted },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
