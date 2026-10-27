import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { Button } from '@/shared/ui/Button';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { ValueCard } from '../components/ValueCard';
import { VALUE_PILLARS } from '../model/valuePillars';

type Props = { onStartAsOwner: () => void; onStartAsWalker: () => void; onLogin: () => void };

/**
 * UX-001: first screen of the app (design proposal 07 · 1). The full logo on top (the cream medal on the dark
 * theme), the promise, three pillars and the entry points: owner, walker and "Ya tengo cuenta".
 */
export function WelcomeScreen({ onStartAsOwner, onStartAsWalker, onLogin }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
    logo: { alignItems: 'center', paddingTop: spacing.md },
    hero: { gap: spacing.md },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    headline: { ...typography.display, color: colors.text },
    highlight: { color: colors.primary },
    lead: { ...typography.body, color: colors.muted },
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.column}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logo}>
            <BrandLogo variant="full" size={150} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>PASEADORES VERIFICADOS, EN VIVO</Text>
            <Text accessibilityRole="header" style={styles.headline}>
              Paseos <Text style={styles.highlight}>seguros</Text> para tu perro
            </Text>
            <Text style={styles.lead}>
              Pide un paseo como pides un viaje: ves al paseador en el mapa y pagas al final.
            </Text>
          </View>

          <View>
            {VALUE_PILLARS.map((pillar, index) => (
              <ValueCard key={pillar.title} index={index} pillar={pillar} />
            ))}
          </View>
        </ScrollView>

        <ActionFooter>
          <Button label="Pedir un paseo" onPress={onStartAsOwner} />
          <Button label="Quiero ser paseador" variant="secondary" onPress={onStartAsWalker} />
          <Button label="Ya tengo cuenta · Iniciar sesión" variant="tertiary" onPress={onLogin} />
        </ActionFooter>
      </View>
    </SafeAreaView>
  );
}
