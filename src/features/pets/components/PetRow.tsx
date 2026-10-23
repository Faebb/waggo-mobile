import { StyleSheet, Text, View } from 'react-native';

import { spacing, touch, typography, useThemedStyles } from '@/shared/ui/theme';

import { describeAge, describePet } from '../model/describePet';
import type { Pet } from '../model/types';

type Props = { pet: Pet };

/** Presentational: one dog in the owner's list, with its initial as a yellow mark. */
export function PetRow({ pet }: Props) {
  const styles = useThemedStyles((colors) => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: touch.minHeight,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    initial: {
      width: touch.minHeight,
      height: touch.minHeight,
      borderRadius: touch.minHeight / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    initialText: { ...typography.subtitle, color: colors.primaryText },
    body: { flex: 1, gap: spacing.xs },
    name: { ...typography.subtitle, color: colors.text },
    age: { ...typography.caption, color: colors.muted },
    summary: { ...typography.body, color: colors.muted },
  }));

  const age = describeAge(pet.birthDate);

  return (
    <View style={styles.row}>
      <View style={styles.initial} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.initialText}>{pet.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.summary}>{describePet(pet)}</Text>
        {age !== null && <Text style={styles.age}>{age}</Text>}
      </View>
    </View>
  );
}
