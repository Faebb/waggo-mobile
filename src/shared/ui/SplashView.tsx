import { ActivityIndicator, View } from 'react-native';

import { BrandLogo } from './BrandLogo';
import { spacing, useColors } from './theme';

/**
 * In-app splash (design proposal 08) shown while fonts and the session load: the full logo and a spinner. It
 * carries no text because the brand fonts are not loaded yet. The native splash (`app.json`) is untouched until
 * the final vector logo exists.
 */
export function SplashView() {
  const colors = useColors();

  return (
    <View
      accessibilityLabel="Cargando Waggo"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
        backgroundColor: colors.background,
      }}
    >
      <BrandLogo variant="full" size={260} />
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
