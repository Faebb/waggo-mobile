import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/shared/api/ApiError';
import { Button } from '@/shared/ui/Button';
import { ChipGroup } from '@/shared/ui/ChipGroup';
import { TextField } from '@/shared/ui/TextField';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { useRegisterPet } from '../hooks/usePets';
import { EMPTY_PET_FORM, toPetDraft, type PetForm, type PetFormErrors } from '../model/petForm';
import { PET_SIZE_LABELS, PET_SIZES, type Pet } from '../model/types';

const sizeOptions = PET_SIZES.map((value) => ({ value, label: PET_SIZE_LABELS[value] }));

type Props = { onSaved: (pet: Pet) => void };

/** RF-004: the owner registers a dog. The medical notes are stored encrypted by the API (RNF-003). */
export function AddPetScreen({ onSaved }: Props) {
  const [form, setForm] = useState<PetForm>(EMPTY_PET_FORM);
  const [errors, setErrors] = useState<PetFormErrors>({});
  const registerPet = useRegisterPet();

  const update = (field: keyof PetForm) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  function save() {
    const result = toPetDraft(form);
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    registerPet.mutate(result.draft, { onSuccess: (pet) => onSaved(pet) });
  }

  const apiMessages =
    registerPet.error instanceof ApiError
      ? registerPet.error.errors.map((error) => error.message)
      : registerPet.isError
        ? ['No pudimos guardar a tu perro. Intenta de nuevo.']
        : [];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Agregar perro
        </Text>

        <TextField label="Nombre" value={form.name} onChangeText={update('name')} error={errors.name} maxLength={50} />
        <TextField label="Raza" value={form.breed} onChangeText={update('breed')} hint="Opcional" maxLength={50} />
        <ChipGroup
          label="Tamaño"
          options={sizeOptions}
          value={form.size}
          onChange={(size) => setForm((current) => ({ ...current, size }))}
        />
        <TextField
          label="Peso (kg)"
          value={form.weightKg}
          onChangeText={update('weightKg')}
          error={errors.weightKg}
          hint="Opcional"
          keyboardType="decimal-pad"
        />
        <TextField
          label="Notas médicas"
          value={form.medicalNotes}
          onChangeText={update('medicalNotes')}
          hint="Opcional. Alergias, medicamentos o cuidados. Se guardan cifradas."
          multiline
          maxLength={2000}
        />

        {apiMessages.length > 0 && (
          <Text accessibilityRole="alert" style={styles.error}>
            {apiMessages.join('\n')}
          </Text>
        )}
      </ScrollView>

      <ActionFooter>
        <Button
          label={registerPet.isPending ? 'Guardando…' : 'Guardar perro'}
          onPress={save}
          disabled={registerPet.isPending}
        />
      </ActionFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: layout.column,
  content: { gap: spacing.lg, padding: spacing.lg },
  title: { ...typography.display, color: colors.text },
  error: { ...typography.body, color: colors.danger },
});
