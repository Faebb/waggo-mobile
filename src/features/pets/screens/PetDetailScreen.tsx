import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { formatIsoDate } from '@/shared/ui/DateField';
import { DetailRow } from '@/shared/ui/DetailRow';
import { ErrorState } from '@/shared/ui/ErrorState';
import { layout, radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { LockIcon } from '../components/PetRow';
import { usePet } from '../hooks/usePets';
import { PET_SIZE_LABELS } from '../model/types';

type Props = { petId: string; onRequestWalk: (petId: string) => void };

/**
 * RF-004 (`GET /pets/{id}`), design proposal 07 · 10: the dog's data, its private medical notes and a shortcut to
 * ask for a walk with it. Editing and photos are out of scope (open question of RF-004).
 */
export function PetDetailScreen({ petId, onRequestWalk }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    hero: { alignItems: 'center', gap: spacing.sm },
    name: { ...typography.title, color: colors.text },
    notes: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface2 },
    notesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    notesTitle: { ...typography.subtitle, color: colors.text },
    notesText: { ...typography.body, color: colors.text },
    notesHint: { ...typography.caption, color: colors.muted },
  }));
  const pet = usePet(petId);

  if (pet.isPending) {
    return <ActivityIndicator accessibilityLabel="Cargando a tu perro" color={colors.primary} />;
  }
  if (pet.isError) {
    return (
      <View style={styles.content}>
        <ErrorState message="No pudimos cargar a tu perro." onRetry={() => void pet.refetch()} />
      </View>
    );
  }

  const data = pet.data;
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar label={data.name} size={88} />
          <Text accessibilityRole="header" style={styles.name}>
            {data.name}
          </Text>
        </View>

        <View>
          <DetailRow label="Tamaño" value={PET_SIZE_LABELS[data.size]} />
          {data.breed !== null && <DetailRow label="Raza" value={data.breed} />}
          {data.weightKg !== null && <DetailRow label="Peso" value={`${String(data.weightKg).replace('.', ',')} kg`} />}
          {data.birthDate !== null && <DetailRow label="Nacimiento" value={formatIsoDate(data.birthDate)} />}
        </View>

        {data.medicalNotes !== null && (
          <View style={styles.notes}>
            <View style={styles.notesTitleRow}>
              <LockIcon color={colors.secondary} size={18} />
              <Text style={styles.notesTitle}>Notas médicas</Text>
            </View>
            <Text style={styles.notesText}>{data.medicalNotes}</Text>
            <Text style={styles.notesHint}>Se guardan cifradas. Hoy solo tú las ves.</Text>
          </View>
        )}
      </ScrollView>

      <ActionFooter>
        <Button label={`Pedir paseo con ${data.name}`} onPress={() => onRequestWalk(data.id)} />
      </ActionFooter>
    </View>
  );
}
