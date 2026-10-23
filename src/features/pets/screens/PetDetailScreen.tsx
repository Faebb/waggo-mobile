import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/shared/api/ApiError';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { layout, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useOwnPet } from '../hooks/usePets';
import { describeAge, formatBirthDate } from '../model/describePet';
import { PET_SIZE_LABELS } from '../model/types';

type Props = { petId: string; onBack: () => void };

const NO_DATA = 'Sin dato';

/** RF-004: the detail of one dog of the owner, including the medical notes (decrypted by the API). */
export function PetDetailScreen({ petId, onBack }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    loading: { margin: spacing.xl },
    content: { gap: spacing.lg, padding: spacing.lg },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
    error: { ...typography.body, color: colors.danger },
  }));
  const { data: pet, isPending, error } = useOwnPet(petId);

  if (isPending && error === null) {
    return <ActivityIndicator accessibilityLabel="Cargando al perro" color={colors.primary} style={styles.loading} />;
  }

  if (pet === undefined) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text accessibilityRole="alert" style={styles.error}>
            {notFound
              ? 'No encontramos a este perro entre los tuyos.'
              : 'No pudimos cargar a este perro. Intenta de nuevo.'}
          </Text>
        </View>
        <ActionFooter>
          <Button label="Volver" onPress={onBack} />
        </ActionFooter>
      </View>
    );
  }

  const age = describeAge(pet.birthDate);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TU PERRO</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {pet.name}
        </Text>
        <View>
          <DetailRow label="Raza" value={pet.breed ?? NO_DATA} />
          <DetailRow label="Tamaño" value={PET_SIZE_LABELS[pet.size]} />
          <DetailRow
            label="Peso"
            value={pet.weightKg === null ? NO_DATA : `${String(pet.weightKg).replace('.', ',')} kg`}
          />
          <DetailRow label="Nacimiento" value={pet.birthDate === null ? NO_DATA : formatBirthDate(pet.birthDate)} />
          <DetailRow label="Edad" value={age ?? NO_DATA} />
          <DetailRow label="Notas médicas" value={pet.medicalNotes ?? NO_DATA} />
        </View>
      </ScrollView>
      <ActionFooter>
        <Button label="Volver" variant="secondary" onPress={onBack} />
      </ActionFooter>
    </View>
  );
}
