import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/shared/api/ApiError';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { ChipGroup } from '@/shared/ui/ChipGroup';
import { DateField } from '@/shared/ui/DateField';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useRegisterPet } from '../hooks/usePets';
import { EMPTY_PET_FORM, toPetDraft, type PetForm, type PetFormErrors } from '../model/petForm';
import { PET_SIZE_CHIP_LABELS, PET_SIZES, type Pet } from '../model/types';

const sizeOptions = PET_SIZES.map((value) => ({ value, label: PET_SIZE_CHIP_LABELS[value] }));

/** API errors shown under their field instead of in the banner (design proposal 07 · 9). */
const FIELD_OF_CODE: Record<string, keyof PetFormErrors> = {
  'Pets.InvalidName': 'name',
  'Pets.InvalidWeight': 'weightKg',
  'Pets.InvalidBirthDate': 'birthDate',
};

type Props = { onSaved: (pet: Pet) => void };

/**
 * RF-004: the owner registers a dog (design proposal 07 · 9). The medical notes are stored encrypted by the API
 * (RNF-003). Field errors from the API go under their field; reaching the limit shows a warning and blocks saving.
 */
export function AddPetScreen({ onSaved }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
  }));
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

  const apiErrors = registerPet.error instanceof ApiError ? registerPet.error.errors : [];
  const fieldErrors: PetFormErrors = { ...errors };
  for (const error of apiErrors) {
    const field = FIELD_OF_CODE[error.code];
    if (field !== undefined) fieldErrors[field] = error.message;
  }
  const bannerMessages = registerPet.isError
    ? apiErrors.length > 0
      ? apiErrors.filter((error) => FIELD_OF_CODE[error.code] === undefined).map((error) => error.message)
      : ['No pudimos guardar a tu perro. Intenta de nuevo.']
    : [];
  const limitReached = apiErrors.some((error) => error.code === 'Pets.LimitReached');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Agregar perro
        </Text>

        {bannerMessages.length > 0 && (
          <Banner tone={limitReached ? 'warning' : 'danger'} message={bannerMessages.join('\n')} />
        )}

        <TextField
          label="Nombre"
          value={form.name}
          onChangeText={update('name')}
          error={fieldErrors.name}
          maxLength={50}
        />
        <ChipGroup
          label="Tamaño"
          options={sizeOptions}
          value={form.size}
          onChange={(size) => setForm((current) => ({ ...current, size }))}
        />
        <TextField label="Raza" value={form.breed} onChangeText={update('breed')} hint="Opcional" maxLength={50} />
        <DateField
          label="Nacimiento"
          value={form.birthDate}
          onChangeText={update('birthDate')}
          error={fieldErrors.birthDate}
          optional
        />
        <TextField
          label="Peso (kg)"
          value={form.weightKg}
          onChangeText={update('weightKg')}
          error={fieldErrors.weightKg}
          hint="Opcional"
          keyboardType="decimal-pad"
        />
        <TextField
          label="Notas médicas"
          value={form.medicalNotes}
          onChangeText={update('medicalNotes')}
          hint="Opcional. Alergias, medicamentos o cuidados. Se guardan cifradas. Hoy solo tú las ves."
          multiline
          maxLength={2000}
        />
      </ScrollView>

      <ActionFooter>
        <Button
          label="Guardar perro"
          loadingLabel="Guardando…"
          loading={registerPet.isPending}
          disabled={limitReached}
          onPress={save}
        />
      </ActionFooter>
    </View>
  );
}
