import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

type Props = {
  label: string;
  pets: readonly { id: string; name: string }[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  error?: string;
};

/** Multiple choice of the owner's dogs. Each dog is a chip button with a `selected` state. */
export function PetPicker({ label, pets, selected, onToggle, error }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {pets.map((pet) => {
          const isSelected = selected.includes(pet.id);
          return (
            <Pressable
              key={pet.id}
              accessibilityRole="button"
              accessibilityLabel={pet.name}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onToggle(pet.id)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <View style={[styles.initial, isSelected && styles.initialSelected]}>
                <Text style={[styles.initialText, isSelected && styles.initialTextSelected]}>
                  {pet.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.name, isSelected && styles.nameSelected]}>{pet.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {error !== undefined && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.caption, fontWeight: '700', color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary },
  initial: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  initialSelected: { backgroundColor: colors.primary },
  initialText: { ...typography.caption, fontWeight: '700', color: colors.text },
  initialTextSelected: { color: colors.primaryText },
  name: { ...typography.body, color: colors.text },
  nameSelected: { fontWeight: '700' },
  error: { ...typography.caption, color: colors.danger },
});
