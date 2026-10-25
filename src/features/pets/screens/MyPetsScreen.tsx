import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { PetRow } from '../components/PetRow';
import { useMyPets } from '../hooks/usePets';

type Props = { onAddPress: () => void };

/** Row-shaped placeholder matching `PetRow`, shown three times while the list loads. */
function PetRowSkeleton() {
  const styles = useThemedStyles((colors) => ({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
    body: { gap: spacing.xs },
    hairline: { borderTopWidth: 1, borderTopColor: colors.border },
  }));
  return (
    <View style={[styles.row, styles.hairline]}>
      <Skeleton width={44} height={44} radius={radius.pill} />
      <View style={styles.body}>
        <Skeleton width={120} height={18} />
        <Skeleton width={90} height={14} />
      </View>
    </View>
  );
}

/** RF-004: the owner sees their dogs and can add a new one. */
export function MyPetsScreen({ onAddPress }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.md, padding: spacing.lg },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.display, color: colors.text, marginBottom: spacing.md },
    error: { ...typography.body, color: colors.danger },
    empty: { gap: spacing.xs, paddingVertical: spacing.lg },
    emptyTitle: { ...typography.subtitle, color: colors.text },
    emptyText: { ...typography.body, color: colors.muted },
  }));
  const { data: pets, isPending, isError } = useMyPets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TUS PERROS</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Mis perros
        </Text>

        {isPending && (
          <View>
            <PetRowSkeleton />
            <PetRowSkeleton />
            <PetRowSkeleton />
          </View>
        )}
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

      <ActionFooter>
        <Button label="Agregar perro" onPress={onAddPress} />
      </ActionFooter>
    </View>
  );
}
