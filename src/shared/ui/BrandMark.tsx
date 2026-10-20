import { Text, View } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from './theme';

/** Waggo wordmark: yellow square + name (ADR-013). Provisional until there is an official logo. */
export function BrandMark() {
  const styles = useThemedStyles((colors) => ({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    mark: { width: 16, height: 16, borderRadius: radius.sm, backgroundColor: colors.primary },
    name: { ...typography.subtitle, color: colors.text },
  }));

  return (
    <View style={styles.row}>
      <View style={styles.mark} />
      <Text style={styles.name}>Waggo</Text>
    </View>
  );
}
