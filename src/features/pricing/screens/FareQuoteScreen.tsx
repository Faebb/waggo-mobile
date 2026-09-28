import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/shared/ui/ChipGroup';
import { colors, spacing } from '@/shared/ui/theme';

import { FareQuoteCard } from '../components/FareQuoteCard';
import { useFareQuote } from '../hooks/useFareQuote';
import {
  DURATION_OPTIONS,
  WALK_TYPE_LABELS,
  WALK_TYPES,
  type DurationMinutes,
  type WalkType,
} from '../model/types';

const walkTypeOptions = WALK_TYPES.map((value) => ({ value, label: WALK_TYPE_LABELS[value] }));
const durationOptions = DURATION_OPTIONS.map((value) => ({ value, label: `${value} min` }));

/** RF-019: the owner picks type and duration and sees the price before confirming. */
export function FareQuoteScreen() {
  const [walkType, setWalkType] = useState<WalkType>('Individual');
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(60);
  const { data, isPending, isError } = useFareQuote({ walkType, durationMinutes });

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        ¿Cuánto cuesta el paseo?
      </Text>

      <ChipGroup label="Tipo de paseo" options={walkTypeOptions} value={walkType} onChange={setWalkType} />
      <ChipGroup label="Duración" options={durationOptions} value={durationMinutes} onChange={setDurationMinutes} />

      {isPending && <ActivityIndicator accessibilityLabel="Calculando tarifa" color={colors.primary} />}
      {isError && (
        <Text accessibilityRole="alert" style={styles.error}>
          No pudimos calcular la tarifa. Intenta de nuevo.
        </Text>
      )}
      {data && <FareQuoteCard quote={data} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  error: { color: colors.danger, fontSize: 15 },
});
