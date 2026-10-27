import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { radius, sizes, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { usePlaceSearch } from '../hooks/usePlaces';
import type { Place } from '../model/types';

type Props = { onSelect: (place: Place) => void };

/**
 * Address search (design 07 · 11) with OpenStreetMap's Nominatim. Unlike Google Places there is no autocomplete:
 * the policy forbids searching on every keystroke, so the user types and presses "Buscar". The results list ends
 * with the attribution of the search data.
 */
export function PlaceSearch({ onSelect }: Props) {
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
    field: { flex: 1 },
    results: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    result: {
      minHeight: sizes.touch,
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pressed: { backgroundColor: colors.surface2 },
    title: { ...typography.body, fontWeight: '700', color: colors.text },
    subtitle: { ...typography.caption, color: colors.muted },
    note: { ...typography.caption, color: colors.muted },
    error: { ...typography.caption, color: colors.danger },
    attribution: { ...typography.micro, color: colors.muted, padding: spacing.sm },
  }));
  const [text, setText] = useState('');
  const [tooShort, setTooShort] = useState(false);
  const search = usePlaceSearch();

  function submit() {
    const query = text.trim();
    setTooShort(query.length < 3);
    if (query.length < 3) return;
    search.mutate(query);
  }

  function choose(place: Place) {
    onSelect(place);
    search.reset();
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.field}>
          <TextField
            label="Buscar dirección"
            value={text}
            onChangeText={setText}
            placeholder="Carrera 7 # 45-10 Bogotá"
            maxLength={200}
          />
        </View>
        <Button
          label="Buscar"
          loadingLabel="Buscando…"
          loading={search.isPending}
          variant="secondary"
          onPress={submit}
        />
      </View>

      {tooShort && <Text style={styles.note}>Escribe al menos 3 letras.</Text>}
      {search.isError && (
        <Text accessibilityRole="alert" style={styles.error}>
          No pudimos buscar la dirección. Revisa tu conexión o escríbela abajo.
        </Text>
      )}
      {search.data?.length === 0 && (
        <Text accessibilityLiveRegion="polite" style={styles.note}>
          No encontramos esa dirección. Prueba con calle y número.
        </Text>
      )}
      {search.data !== undefined && search.data.length > 0 && (
        <View style={styles.results}>
          {search.data.map((place) => (
            <Pressable
              key={place.id}
              accessibilityRole="button"
              accessibilityLabel={place.subtitle ? `${place.title}, ${place.subtitle}` : place.title}
              onPress={() => choose(place)}
              style={({ pressed }) => [styles.result, pressed && styles.pressed]}
            >
              <Text style={styles.title}>{place.title}</Text>
              {place.subtitle !== '' && <Text style={styles.subtitle}>{place.subtitle}</Text>}
            </Pressable>
          ))}
          <Text style={styles.attribution}>Búsqueda: © OpenStreetMap contributors (Nominatim)</Text>
        </View>
      )}
    </View>
  );
}
