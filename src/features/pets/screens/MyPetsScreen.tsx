import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { PetRow } from '../components/PetRow';
import { useMyPets } from '../hooks/usePets';
import { MAX_PETS_PER_OWNER } from '../model/types';

type Props = { onAddPress: () => void; onOpenPet: (id: string) => void };

/** RF-004: the owner sees their dogs, opens one and can add a new one (design proposal 07 · 8). */
export function MyPetsScreen({ onAddPress, onOpenPet }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.md, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    counter: { ...typography.caption, color: colors.muted },
    header: { gap: spacing.xs },
    skeletons: { gap: spacing.md },
  }));
  const pets = useMyPets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Mis perros
          </Text>
          {pets.data !== undefined && pets.data.length > 0 && (
            <Text style={styles.counter}>
              {pets.data.length} de {MAX_PETS_PER_OWNER} perros
            </Text>
          )}
        </View>

        {pets.isPending && (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Cargando tus perros"
            style={styles.skeletons}
          >
            <Skeleton width="100%" height={80} radius={radius.md} />
            <Skeleton width="100%" height={80} radius={radius.md} />
          </View>
        )}
        {pets.isError && <ErrorState message="No pudimos cargar tus perros." onRetry={() => void pets.refetch()} />}
        {pets.data?.length === 0 && (
          <EmptyState
            title="Aún no tienes perros"
            message="Agrégalos una vez y elígelos en segundos cada vez que pidas un paseo."
            actionLabel="Agregar mi primer perro"
            onAction={onAddPress}
          />
        )}
        {pets.data?.map((pet) => (
          <PetRow key={pet.id} pet={pet} onPress={() => onOpenPet(pet.id)} />
        ))}
      </ScrollView>

      {pets.data !== undefined && pets.data.length > 0 && (
        <ActionFooter>
          <Button label="Agregar perro" onPress={onAddPress} />
        </ActionFooter>
      )}
    </View>
  );
}
