import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { PARTY_NAMES, type WalkMessage, type WalkParty } from '../model/types';

type Props = { message: WalkMessage; viewer: WalkParty };

/** A chat bubble: mine on the right in yellow, the other person's on the left. */
export function MessageBubble({ message, viewer }: Props) {
  const mine = message.sentBy === viewer;
  const author = mine ? 'Tú' : PARTY_NAMES[message.sentBy];
  const date = new Date(message.sentAt);
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <View
      accessible
      accessibilityLabel={`${author}: ${message.text}`}
      style={[styles.bubble, mine ? styles.mine : styles.theirs]}
    >
      <Text style={[styles.text, mine && styles.mineText]}>{message.text}</Text>
      <Text style={[styles.time, mine && styles.mineTime]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  text: { ...typography.body, color: colors.text },
  mineText: { color: colors.primaryText },
  time: { ...typography.caption, alignSelf: 'flex-end', color: colors.muted },
  mineTime: { color: colors.primaryText },
});
