import { Text, View } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { PARTY_NAMES, type WalkMessage, type WalkParty } from '../model/types';

type Props = { message: WalkMessage; viewer: WalkParty };

/**
 * A chat bubble (design proposal 07 · 20): mine on the right in `primary`, the other person's on the left in
 * `surface`, with the time inside. Read as "Paseador, 15:02: …".
 */
export function MessageBubble({ message, viewer }: Props) {
  const styles = useThemedStyles((colors) => ({
    bubble: {
      maxWidth: '80%',
      gap: 2,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
    },
    mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
    theirs: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: radius.sm,
    },
    text: { ...typography.body, color: colors.text },
    mineText: { color: colors.primaryText },
    time: { ...typography.micro, alignSelf: 'flex-end', color: colors.muted },
    mineTime: { color: colors.primaryText },
  }));
  const mine = message.sentBy === viewer;
  const author = mine ? 'Tú' : PARTY_NAMES[message.sentBy];
  const date = new Date(message.sentAt);
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <View
      accessible
      accessibilityLabel={`${author}, ${time}: ${message.text}`}
      style={[styles.bubble, mine ? styles.mine : styles.theirs]}
    >
      <Text style={[styles.text, mine && styles.mineText]}>{message.text}</Text>
      <Text style={[styles.time, mine && styles.mineTime]}>{time}</Text>
    </View>
  );
}
