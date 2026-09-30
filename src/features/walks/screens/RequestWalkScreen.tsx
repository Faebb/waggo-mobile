import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMyPets } from '@/features/pets';
import {
  DURATION_OPTIONS,
  formatMoney,
  useFareQuote,
  WALK_TYPE_LABELS,
  WALK_TYPES,
  type DurationMinutes,
  type WalkType,
} from '@/features/pricing';
import { ApiError } from '@/shared/api/ApiError';
import { getCurrentLocation, type Coordinates } from '@/shared/location/getCurrentLocation';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { ChipGroup } from '@/shared/ui/ChipGroup';
import { TextField } from '@/shared/ui/TextField';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { PetPicker } from '../components/PetPicker';
import { useRequestWalk } from '../hooks/useWalks';
import type { Walk } from '../model/types';
import { scheduledForOf, WHEN_OPTIONS, type When } from '../model/whenOptions';

const walkTypeOptions = WALK_TYPES.map((value) => ({ value, label: WALK_TYPE_LABELS[value] }));
const durationOptions = DURATION_OPTIONS.map((value) => ({ value, label: `${value} min` }));
const whenOptions = WHEN_OPTIONS.map(({ value, label }) => ({ value, label }));

type Errors = Partial<Record<'pets' | 'address' | 'location', string>>;
type LocationState = { status: 'idle' | 'locating' | 'denied' } | { status: 'ready'; coordinates: Coordinates };

type Props = { onRequested: (walk: Walk) => void; onAddPet: () => void };

/** RF-007: the owner asks for a walk — who, how long, when and where — and sees the price before confirming. */
export function RequestWalkScreen({ onRequested, onAddPet }: Props) {
  const pets = useMyPets();
  const [petIds, setPetIds] = useState<string[]>([]);
  const [walkType, setWalkType] = useState<WalkType>('Individual');
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(60);
  const [when, setWhen] = useState<When>('now');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const [errors, setErrors] = useState<Errors>({});
  const quote = useFareQuote({ walkType, durationMinutes });
  const request = useRequestWalk();

  const togglePet = (id: string) =>
    setPetIds((current) => (current.includes(id) ? current.filter((petId) => petId !== id) : [...current, id]));

  async function locate() {
    setLocation({ status: 'locating' });
    const coordinates = await getCurrentLocation();
    setLocation(coordinates ? { status: 'ready', coordinates } : { status: 'denied' });
  }

  function submit() {
    const found: Errors = {};
    if (petIds.length === 0) found.pets = 'Elige al menos un perro.';
    if (address.trim() === '') found.address = 'Escribe la dirección de recogida.';
    if (location.status !== 'ready') found.location = 'Usa tu ubicación para que el paseador te encuentre.';
    setErrors(found);
    if (location.status !== 'ready' || Object.keys(found).length > 0) {
      return;
    }

    request.mutate(
      {
        petIds,
        walkType,
        durationMinutes,
        pickupAddress: address.trim(),
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        scheduledFor: scheduledForOf(when),
        notes: notes.trim() === '' ? null : notes.trim(),
      },
      { onSuccess: (walk) => onRequested(walk) },
    );
  }

  const apiMessages =
    request.error instanceof ApiError
      ? request.error.errors.map((error) => error.message)
      : request.isError
        ? ['No pudimos pedir el paseo. Intenta de nuevo.']
        : [];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Pedir paseo
        </Text>

        {pets.isPending && <ActivityIndicator accessibilityLabel="Cargando tus perros" color={colors.primary} />}
        {pets.data?.length === 0 && (
          <View style={styles.noPets}>
            <Text style={styles.noPetsText}>Primero agrega a tu perro.</Text>
            <Button label="Agregar perro" variant="secondary" onPress={onAddPet} />
          </View>
        )}
        {pets.data && pets.data.length > 0 && (
          <PetPicker label="¿Quién sale?" pets={pets.data} selected={petIds} onToggle={togglePet} error={errors.pets} />
        )}

        <ChipGroup label="Tipo de paseo" options={walkTypeOptions} value={walkType} onChange={setWalkType} />
        <ChipGroup label="Duración" options={durationOptions} value={durationMinutes} onChange={setDurationMinutes} />
        <ChipGroup label="¿Cuándo?" options={whenOptions} value={when} onChange={setWhen} />

        <View style={styles.group}>
          <TextField
            label="Dirección de recogida"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            placeholder="Cra 7 # 45-10, Bogotá"
            maxLength={200}
          />
          <Button
            label={location.status === 'locating' ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
            variant="secondary"
            onPress={locate}
            disabled={location.status === 'locating'}
          />
          {location.status === 'ready' && <Text style={styles.ok}>Ubicación lista</Text>}
          {location.status === 'denied' && (
            <Text style={styles.error}>
              No pudimos obtener tu ubicación. Revisa el permiso de ubicación e intenta de nuevo.
            </Text>
          )}
          {location.status !== 'ready' && location.status !== 'denied' && errors.location !== undefined && (
            <Text style={styles.error}>{errors.location}</Text>
          )}
        </View>

        <TextField
          label="Indicaciones para el paseador"
          value={notes}
          onChangeText={setNotes}
          hint="Opcional. Por ejemplo: timbre dañado, llamar al llegar."
          multiline
          maxLength={500}
        />

        {apiMessages.length > 0 && (
          <Text accessibilityRole="alert" style={styles.error}>
            {apiMessages.join('\n')}
          </Text>
        )}
      </ScrollView>

      <ActionFooter>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>
            {quote.data ? formatMoney(quote.data.total, quote.data.currency) : 'Calculando…'}
          </Text>
        </View>
        <Button label={request.isPending ? 'Pidiendo…' : 'Pedir paseo'} onPress={submit} disabled={request.isPending} />
      </ActionFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: layout.column,
  content: { gap: spacing.lg, padding: spacing.lg },
  title: { ...typography.display, color: colors.text },
  noPets: { gap: spacing.md },
  noPetsText: { ...typography.body, color: colors.muted },
  group: { gap: spacing.sm },
  ok: { ...typography.caption, fontWeight: '700', color: colors.primary },
  error: { ...typography.caption, color: colors.danger },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  priceLabel: { ...typography.body, color: colors.muted },
  price: { ...typography.title, color: colors.primary },
});
