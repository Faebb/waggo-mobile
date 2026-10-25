import { Text, View } from 'react-native';

import { radius, typography, useThemedStyles } from './theme';

type Props = { label: string; size?: number };

/** Circle with the first letter of a name or email. No photo upload exists yet (vault › perfil de usuario). */
export function Avatar({ label, size = 64 }: Props) {
  const styles = useThemedStyles((colors) => ({
    circle: {
      width: size,
      height: size,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    letter: { ...typography.title, fontSize: size * 0.4, lineHeight: size * 0.4, color: colors.primaryText },
  }));
  const initial = label.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.circle}>
      <Text style={styles.letter}>{initial}</Text>
    </View>
  );
}
