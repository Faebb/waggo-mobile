import { Pressable, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Avatar } from '@/shared/ui/Avatar';
import { radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { describePet } from '../model/describePet';
import type { Pet } from '../model/types';

type Props = { pet: Pet; onPress: () => void };

/**
 * One dog in the owner's list (design proposal 07 · 8): a card with the initial, the name, "Size · Breed · Weight"
 * and a lock when it has private medical notes. Opens the detail.
 */
export function PetRow({ pet, onPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: { opacity: 0.85 },
    body: { flex: 1, gap: spacing.xs },
    name: { ...typography.subtitle, color: colors.text },
    summary: { ...typography.body, color: colors.muted },
    notes: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    notesText: { ...typography.micro, color: colors.secondary },
    chevron: { ...typography.title, color: colors.muted },
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar label={pet.name} size={48} />
      <View style={styles.body}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.summary}>{describePet(pet)}</Text>
        {pet.medicalNotes !== null && (
          <View style={styles.notes}>
            <LockIcon color={colors.secondary} />
            <Text style={styles.notesText}>Notas médicas privadas</Text>
          </View>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

/** Private data (medical notes, RNF-003): a padlock. */
export function LockIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} aria-hidden>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}
