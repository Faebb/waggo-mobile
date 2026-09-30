import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/ui/theme';

import { describePet } from '../model/describePet';
import type { Pet } from '../model/types';

type Props = { pet: Pet };

/** Presentational: one dog in the owner's list, with its initial as a yellow mark. */
export function PetRow({ pet }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.initial} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.initialText}>{pet.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.summary}>{describePet(pet)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  initial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  initialText: { ...typography.subtitle, color: colors.primaryText },
  body: { flex: 1, gap: spacing.xs },
  name: { ...typography.subtitle, color: colors.text },
  summary: { ...typography.body, color: colors.muted },
});
