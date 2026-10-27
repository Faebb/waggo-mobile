import { useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, View } from 'react-native';

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
import { addressOf, PlaceSearch, useReverseGeocode, type Place } from '@/features/places';
import { ApiError } from '@/shared/api/ApiError';
import {
  getDevicePosition,
  getLocationPermission,
  WEAK_GPS_METERS,
  type DevicePosition,
} from '@/shared/location/devicePosition';
import type { Coordinates } from '@/shared/location/getCurrentLocation';
import { COUNTRY_ZOOM, DEFAULT_CENTER, MIN_PICK_ZOOM, PLACE_ZOOM } from '@/shared/map/mapConfig';
import type { LatLng, MapMarker } from '@/shared/map/types';
import { WaggoMap } from '@/shared/map/WaggoMap';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { ChipGroup } from '@/shared/ui/ChipGroup';
import { DateField } from '@/shared/ui/DateField';
import { DetailRow } from '@/shared/ui/DetailRow';
import { ShieldCheckIcon } from '@/shared/ui/icons/ShieldCheckIcon';
import { TextField } from '@/shared/ui/TextField';
import { layout, radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { PetPicker } from '../components/PetPicker';
import { StepHeader } from '../components/StepHeader';
import { useRequestWalk } from '../hooks/useWalks';
import type { Walk } from '../model/types';
import { formatWhen, petNamesOf, walkKindOf } from '../model/describeWalk';
import {
  formatTimeText,
  MAX_DAYS_AHEAD,
  otherDateOf,
  scheduledForOf,
  WHEN_OPTIONS,
  type When,
} from '../model/whenOptions';

const walkTypeOptions = WALK_TYPES.map((value) => ({ value, label: WALK_TYPE_LABELS[value] }));
const durationOptions = DURATION_OPTIONS.map((value) => ({ value, label: `${value} min` }));
const whenOptions = WHEN_OPTIONS.map(({ value, label }) => ({ value, label }));

/** API errors about the dogs or the time send the owner back to step 2, where those fields are. */
const DETAIL_ERROR_CODES = ['Walks.InvalidPets', 'Walks.InvalidSchedule'];

type Step = 1 | 2 | 3;
type Errors = Partial<Record<'pets' | 'address' | 'location' | 'date' | 'time', string>>;
type MapView = { center: LatLng; zoom: number };

type Props = {
  onRequested: (walk: Walk) => void;
  onAddPet: () => void;
  /** Dogs already chosen, e.g. from "Pedir paseo con Luna" on the dog detail. */
  initialPetIds?: readonly string[];
};

/**
 * RF-007: the owner asks for a walk in three short steps, like asking for a ride (design proposal 07 · 11–13):
 * 1 · where (pickup), 2 · who and how much (dogs, kind, duration, when, live price), 3 · confirm and pay. The
 * request body is the same as before (no API change).
 *
 * Step 1 is the OpenStreetMap map with a pin fixed in the center (design 07 · 11): the owner searches the address
 * (Nominatim, on "Buscar"), uses the phone location (explained before the system dialog) or moves the map under
 * the pin. The address comes from the reverse lookup and stays editable; what the owner typed is never replaced.
 */
export function RequestWalkScreen({ onRequested, onAddPet, initialPetIds = [] }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    group: { gap: spacing.sm },
    ok: { ...typography.caption, fontWeight: '700', color: colors.success },
    error: { ...typography.caption, color: colors.danger },
    help: { ...typography.caption, color: colors.muted },
    noPets: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface2 },
    noPetsTitle: { ...typography.subtitle, color: colors.text },
    noPetsText: { ...typography.body, color: colors.muted },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    priceLabel: { ...typography.body, color: colors.muted },
    price: { ...typography.title, color: colors.primary },
    payment: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
    paymentTotal: { ...typography.display, color: colors.text },
    escrow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    escrowText: { ...typography.caption, flex: 1, color: colors.muted },
    explain: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
    explainText: { ...typography.body, color: colors.text },
  }));
  const pets = useMyPets();
  const [step, setStep] = useState<Step>(1);
  const [petIds, setPetIds] = useState<string[]>(() => [...initialPetIds]);
  const [walkType, setWalkType] = useState<WalkType>('Individual');
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(60);
  const [when, setWhen] = useState<When>('now');
  const [otherDate, setOtherDate] = useState('');
  const [otherTime, setOtherTime] = useState('');
  /** `scheduledFor` of "Otra fecha", checked when leaving step 2. */
  const [otherScheduledFor, setOtherScheduledFor] = useState<string | null>(null);
  const [typedAddress, setTypedAddress] = useState<string | null>(null);
  const [chosenAddress, setChosenAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [pickup, setPickup] = useState<Coordinates | null>(null);
  const [view, setView] = useState<MapView>({ center: DEFAULT_CENTER, zoom: COUNTRY_ZOOM });
  const [lookupPoint, setLookupPoint] = useState<Coordinates | null>(null);
  const [device, setDevice] = useState<DevicePosition | null>(null);
  const [locating, setLocating] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [denied, setDenied] = useState(false);
  const [moving, setMoving] = useState(false);
  const lookup = useReverseGeocode(lookupPoint);
  const [errors, setErrors] = useState<Errors>({});
  const quote = useFareQuote({ walkType, durationMinutes });
  const request = useRequestWalk();

  const togglePet = (id: string) =>
    setPetIds((current) => (current.includes(id) ? current.filter((petId) => petId !== id) : [...current, id]));
  const total = quote.data ? formatMoney(quote.data.total, quote.data.currency) : undefined;

  const lookedUpAddress = lookupPoint !== null && lookup.data ? addressOf(lookup.data) : '';
  const address = typedAddress ?? (lookedUpAddress || chosenAddress);

  function placePickup(point: Coordinates) {
    setPickup(point);
    setView({ center: point, zoom: PLACE_ZOOM });
  }

  async function askLocation() {
    if ((await getLocationPermission()) === 'undetermined') {
      setExplaining(true);
      return;
    }
    await locate();
  }

  async function locate() {
    setExplaining(false);
    setLocating(true);
    const position = await getDevicePosition();
    setLocating(false);
    setDenied(position === null);
    setDevice(position);
    if (position === null) return;
    placePickup(position.coordinates);
    setLookupPoint(position.coordinates);
    setChosenAddress('');
  }

  function choosePlace(place: Place) {
    placePickup({ latitude: place.latitude, longitude: place.longitude });
    setLookupPoint(null);
    setChosenAddress(addressOf(place));
    setTypedAddress(null);
  }

  function moveMap(center: LatLng, zoom: number) {
    setMoving(false);
    setView({ center, zoom });
    if (zoom < MIN_PICK_ZOOM) return;
    setPickup(center);
    setLookupPoint(center);
    setChosenAddress('');
  }

  function confirmPickup() {
    const found: Errors = {};
    if (address.trim() === '') found.address = 'Escribe la dirección de recogida.';
    if (pickup === null) found.location = 'Busca la dirección, usa tu ubicación o mueve el mapa hasta la recogida.';
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(2);
  }

  function confirmDetails() {
    const found: Errors = {};
    if (petIds.length === 0) found.pets = 'Elige al menos un perro.';
    if (when === 'other') {
      const other = otherDateOf(otherDate, otherTime);
      if (other.ok) setOtherScheduledFor(other.scheduledFor);
      else Object.assign(found, other.errors);
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    request.reset();
    setStep(3);
  }

  function submit() {
    if (pickup === null) return;
    request.mutate(
      {
        petIds,
        walkType,
        durationMinutes,
        pickupAddress: address.trim(),
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        scheduledFor: when === 'other' ? otherScheduledFor : scheduledForOf(when),
        notes: notes.trim() === '' ? null : notes.trim(),
      },
      {
        onSuccess: (walk) => onRequested(walk),
        onError: (error) => {
          if (error instanceof ApiError && error.errors.some((e) => DETAIL_ERROR_CODES.includes(e.code))) {
            setStep(2);
          }
        },
      },
    );
  }

  const apiMessages =
    request.error instanceof ApiError
      ? request.error.errors.map((error) => error.message)
      : request.isError
        ? ['No pudimos pedir el paseo. Intenta de nuevo.']
        : [];
  const apiBanner = apiMessages.length > 0 && <Banner tone="danger" message={apiMessages.join('\n')} />;
  const back = () => setStep((current) => (current > 1 ? ((current - 1) as Step) : current));

  if (step === 1) {
    const markers: MapMarker[] = device
      ? [
          {
            id: 'me',
            kind: 'owner',
            position: device.coordinates,
            label: 'Tu ubicación',
            ...(device.accuracyMeters !== null && { accuracyMeters: device.accuracyMeters }),
          },
        ]
      : [];
    const weakGps = device !== null && device.accuracyMeters !== null && device.accuracyMeters > WEAK_GPS_METERS;
    const mapLabel =
      pickup === null
        ? 'Mapa para elegir la recogida. Busca la dirección o usa tu ubicación.'
        : `Mapa: la recogida está en el centro${address.trim() ? `, ${address.trim()}` : ''}. Mueve el mapa para ajustarla.`;

    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <StepHeader step={1} total={3} title="¿Dónde recogemos a tus perros?" />

          {explaining && (
            <View style={styles.explain}>
              <Text style={styles.explainText}>
                Para encontrar paseadores cerca y mostrar la recogida, Waggo usa tu ubicación mientras usas la app.
              </Text>
              <Button label="Permitir ubicación" onPress={locate} />
              <Button label="Escribir la dirección" variant="secondary" onPress={() => setExplaining(false)} />
            </View>
          )}
          {denied && (
            <Banner
              tone="warning"
              title="No tenemos acceso a tu ubicación."
              message="Escribe la dirección o actívala en Ajustes."
              actionLabel="Abrir Ajustes"
              onAction={() => void Linking.openSettings()}
            />
          )}
          {device?.approximate && (
            <Banner tone="warning" message="Tu ubicación es aproximada. Activa 'Ubicación precisa' o ajusta el pin." />
          )}
          {weakGps && !device?.approximate && (
            <Banner tone="info" message="Señal GPS débil. La posición puede variar." />
          )}

          <PlaceSearch onSelect={choosePlace} />

          <WaggoMap
            center={view.center}
            zoom={view.zoom}
            markers={markers}
            centerPin
            onMoveStart={() => setMoving(true)}
            onCenterChange={moveMap}
            accessibilityLabel={mapLabel}
            height={300}
            failureMessage="Puedes buscar o escribir la dirección y usar tu ubicación."
          />

          <View style={styles.group}>
            <Button
              label="Usar mi ubicación"
              loadingLabel="Buscando tu ubicación…"
              loading={locating}
              variant="secondary"
              onPress={askLocation}
            />
            {moving && <Text style={styles.help}>Suelta para elegir este punto.</Text>}
            {!moving && pickup !== null && <Text style={styles.ok}>Ubicación lista</Text>}
            {!moving && pickup === null && view.zoom < MIN_PICK_ZOOM && view.zoom !== COUNTRY_ZOOM && (
              <Text style={styles.help}>Acerca el mapa para elegir el punto exacto.</Text>
            )}
            {pickup === null && errors.location !== undefined && <Text style={styles.error}>{errors.location}</Text>}
          </View>

          <View style={styles.group}>
            <TextField
              label="Dirección de recogida"
              value={address}
              onChangeText={setTypedAddress}
              error={errors.address}
              placeholder="Cra 7 # 45-10, Bogotá"
              maxLength={200}
            />
            {lookup.isFetching && <Text style={styles.help}>Buscando la dirección de este punto…</Text>}
            {lookup.isError && typedAddress === null && (
              <Text style={styles.help}>No encontramos la dirección de este punto. Escríbela.</Text>
            )}
            <Text style={styles.help}>
              Mueve el mapa para ajustar el punto exacto. El paseador recoge a tus perros aquí.
            </Text>
          </View>
        </ScrollView>

        <ActionFooter>
          <Button label="Confirmar recogida" onPress={confirmPickup} disabled={moving} />
        </ActionFooter>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <StepHeader step={2} total={3} title="¿Quién sale y cuánto?" onBack={back} />
          {apiBanner}

          {pets.isPending && <ActivityIndicator accessibilityLabel="Cargando tus perros" color={colors.primary} />}
          {pets.data?.length === 0 && (
            <View style={styles.noPets}>
              <Text style={styles.noPetsTitle}>Agrega a tu perro para pedir</Text>
              <Text style={styles.noPetsText}>Solo toma un minuto.</Text>
              <Button label="Agregar mi perro" onPress={onAddPet} />
            </View>
          )}
          {pets.data && pets.data.length > 0 && (
            <PetPicker label="Perros" pets={pets.data} selected={petIds} onToggle={togglePet} error={errors.pets} />
          )}

          <ChipGroup label="Tipo de paseo" options={walkTypeOptions} value={walkType} onChange={setWalkType} />
          <ChipGroup label="Duración" options={durationOptions} value={durationMinutes} onChange={setDurationMinutes} />
          <ChipGroup label="¿Cuándo?" options={whenOptions} value={when} onChange={setWhen} />
          {when === 'other' && (
            <View style={styles.group}>
              <DateField label="Fecha" value={otherDate} onChangeText={setOtherDate} error={errors.date} />
              <TextField
                label="Hora"
                value={otherTime}
                onChangeText={(text) => setOtherTime(formatTimeText(text))}
                error={errors.time}
                hint="24 horas, por ejemplo 14:30."
                placeholder="HH:MM"
                keyboardType="number-pad"
                maxLength={5}
              />
              <Text style={styles.help}>{`Puedes programar hasta ${MAX_DAYS_AHEAD} días desde hoy.`}</Text>
            </View>
          )}

          <TextField
            label="Indicaciones para el paseador (opcional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Timbre dañado, llamar al llegar"
            multiline
            maxLength={500}
          />
        </ScrollView>

        <ActionFooter>
          {quote.isError && (
            <Banner
              tone="danger"
              message="No pudimos calcular el precio."
              actionLabel="Reintentar"
              onAction={() => void quote.refetch()}
            />
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{`Total · ${walkKindOf({ walkType, durationMinutes })}`}</Text>
            <Text style={styles.price}>{total ?? (quote.isError ? '—' : 'Calculando…')}</Text>
          </View>
          <Button label="Continuar" onPress={confirmDetails} disabled={pets.data?.length === 0} />
        </ActionFooter>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <StepHeader step={3} total={3} title="Confirma tu paseo" onBack={request.isPending ? undefined : back} />
        {apiBanner}

        {pickup !== null && (
          <WaggoMap
            center={pickup}
            zoom={PLACE_ZOOM}
            markers={[{ id: 'pickup', kind: 'pickup', position: pickup, label: `Recogida: ${address.trim()}` }]}
            interactive={false}
            accessibilityLabel="Mapa de la recogida"
            height={140}
          />
        )}

        <View>
          <DetailRow label="Recogida" value={address.trim()} />
          <DetailRow label="Perros" value={petNamesOf(petIds, pets.data ?? [])} />
          <DetailRow label="Paseo" value={walkKindOf({ walkType, durationMinutes })} />
          <DetailRow
            label="Cuándo"
            value={
              when === 'other' && otherScheduledFor !== null
                ? formatWhen(otherScheduledFor)
                : (WHEN_OPTIONS.find((option) => option.value === when)?.label ?? '')
            }
          />
          {notes.trim() !== '' && <DetailRow label="Indicaciones" value={notes.trim()} />}
        </View>

        <View style={styles.payment}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.paymentTotal}>{total ?? '—'}</Text>
          {quote.data && (
            <Text style={styles.help}>
              {`Incluye la comisión de Waggo (${formatMoney(quote.data.commission, quote.data.currency)})`}
            </Text>
          )}
        </View>

        <View style={styles.escrow}>
          <ShieldCheckIcon color={colors.secondary} size={20} />
          <Text style={styles.escrowText}>
            {`Retenemos ${total ?? 'el total'} y solo se cobra si el paseo ocurre. Si cancelas antes de que empiece, se libera.`}
          </Text>
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label={total ? `Pedir paseo · ${total}` : 'Pedir paseo'}
          loadingLabel="Pidiendo…"
          loading={request.isPending}
          disabled={!quote.data}
          onPress={submit}
        />
      </ActionFooter>
    </View>
  );
}
