import { Text, View } from 'react-native';

import { radius, spacing, typography, useColors, useThemedStyles } from './theme';
import { PawIcon } from './icons/PawIcon';

type Props = { variant?: 'default' | 'inverted' };

/**
 * Waggo wordmark: the paw mark (vault › Sistema de diseño Seashell & Sapphire) + name. `inverted` drops the
 * colored box and shows the mark and name in the current (light) color, for use on a colored background
 * (e.g. `AuthHeader`) where the default box would blend in.
 */
export function BrandMark({ variant = 'default' }: Props) {
  const styles = useThemedStyles((colors) => ({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    mark: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: { ...typography.subtitle, color: variant === 'inverted' ? colors.primaryText : colors.text },
  }));
  const colors = useColors();

  return (
    <View style={styles.row}>
      {variant === 'default' ? (
        <View style={styles.mark}>
          <PawIcon color={colors.primaryText} size={18} />
        </View>
      ) : (
        <PawIcon color={colors.primaryText} size={22} />
      )}
      <Text style={styles.name}>Waggo</Text>
    </View>
  );
}
