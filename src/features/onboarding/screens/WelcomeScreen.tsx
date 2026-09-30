import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { BrandMark } from '@/shared/ui/BrandMark';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { ValueCard } from '../components/ValueCard';
import { VALUE_PILLARS } from '../model/valuePillars';

type Props = { onStartAsOwner: () => void; onStartAsWalker: () => void };

/** UX-001: first screen of the app. Presents Waggo; owners and walkers enter from here, like a ride app. */
export function WelcomeScreen({ onStartAsOwner, onStartAsWalker }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.column}>
        <ScrollView contentContainerStyle={styles.content}>
          <BrandMark />

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>PASEO SEGURO DE PERROS</Text>
            <Text accessibilityRole="header" style={styles.headline}>
              Paseos <Text style={styles.highlight}>seguros</Text> para tu perro
            </Text>
            <Text style={styles.lead}>
              Confía tu perro a un paseador verificado, sigue el paseo en vivo y paga solo cuando termina bien.
            </Text>
          </View>

          <View>
            {VALUE_PILLARS.map((pillar, index) => (
              <ValueCard key={pillar.title} index={index} pillar={pillar} />
            ))}
          </View>
        </ScrollView>

        <ActionFooter>
          <Button label="Quiero pasear a mi perro" onPress={onStartAsOwner} />
          <Button label="Soy paseador" variant="secondary" onPress={onStartAsWalker} />
          <Text style={styles.note}>Muy pronto podrás crear tu cuenta como dueño o paseador.</Text>
        </ActionFooter>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  column: layout.column,
  content: { gap: spacing.xl, padding: spacing.lg },
  hero: { gap: spacing.md, paddingTop: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  headline: { ...typography.display, color: colors.text },
  highlight: { color: colors.primary },
  lead: { ...typography.body, color: colors.muted },
  note: { ...typography.caption, color: colors.muted, textAlign: 'center' },
});
