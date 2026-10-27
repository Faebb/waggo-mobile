import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/shared/api/ApiError';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { ChipGroup } from '@/shared/ui/ChipGroup';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useRegisterWalker } from '../hooks/useWalkerProfile';
import { EMPTY_WALKER_FORM, toWalkerDraft, type WalkerForm, type WalkerFormErrors } from '../model/walkerForm';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES, type WalkerProfile } from '../model/types';

const documentOptions = DOCUMENT_TYPES.map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

type Props = { onRegistered?: (profile: WalkerProfile) => void };

/**
 * RF-002: someone who wants to walk dogs leaves their data. Like a driver joining Uber, nobody gets walks until the
 * profile is verified (RF-003). The document number is stored encrypted and only its last 4 digits are shown.
 */
export function BecomeWalkerScreen({ onRegistered }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    screen: { ...layout.column, flex: 1 },
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
    lead: { ...typography.body, color: colors.muted },
  }));
  const [form, setForm] = useState<WalkerForm>(EMPTY_WALKER_FORM);
  const [errors, setErrors] = useState<WalkerFormErrors>({});
  const register = useRegisterWalker();

  const update = (field: keyof WalkerForm) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  function send() {
    const result = toWalkerDraft(form);
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    register.mutate(result.draft, { onSuccess: (profile) => onRegistered?.(profile) });
  }

  const apiMessages =
    register.error instanceof ApiError
      ? register.error.errors.map((error) => error.message)
      : register.isError
        ? ['No pudimos enviar tus datos. Intenta de nuevo.']
        : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MODO PASEADOR</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Hazte paseador
            </Text>
            <Text style={styles.lead}>
              Antes de tu primer paseo verificamos tu identidad. Así los dueños saben quién cuida a su perro.
            </Text>
          </View>

          <TextField
            label="Nombre completo"
            value={form.fullName}
            onChangeText={update('fullName')}
            error={errors.fullName}
            autoCapitalize="words"
            maxLength={100}
          />
          <ChipGroup
            label="Tipo de documento"
            options={documentOptions}
            value={form.documentType}
            onChange={(documentType) => setForm((current) => ({ ...current, documentType }))}
          />
          <TextField
            label="Número de documento"
            value={form.documentNumber}
            onChangeText={update('documentNumber')}
            error={errors.documentNumber}
            hint="Se guarda cifrado. Solo mostramos los últimos 4 dígitos."
            autoCapitalize="characters"
            maxLength={20}
          />
          <TextField
            label="Celular"
            value={form.phone}
            onChangeText={update('phone')}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={13}
          />
          <TextField
            label="Experiencia con perros"
            value={form.experience}
            onChangeText={update('experience')}
            hint="Opcional. Cuéntales a los dueños con qué perros has trabajado."
            multiline
            maxLength={500}
          />

          {apiMessages.length > 0 && <Banner tone="danger" message={apiMessages.join('\n')} />}
        </ScrollView>

        <ActionFooter>
          <Button
            label="Enviar para verificación"
            loadingLabel="Enviando…"
            loading={register.isPending}
            onPress={send}
          />
        </ActionFooter>
      </View>
    </SafeAreaView>
  );
}
