import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { ValueCard } from '../components/ValueCard';
import { VALUE_PILLARS } from '../model/valuePillars';

type Props = { onQuotePress: () => void };

/** UX-001: first screen of the app. Presents Waggo and leads to the fare quote (RF-019). */
export function WelcomeScreen({ onQuotePress }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.logo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={styles.logoText}>🐾</Text>
          </View>
          <Text style={styles.brand}>Waggo</Text>
          <Text accessibilityRole="header" style={styles.headline}>
            Paseos seguros para tu perro
          </Text>
          <Text style={styles.lead}>
            Confía tu perro a un paseador verificado, sigue el paseo en vivo y paga solo cuando termina bien.
          </Text>
        </View>

        <View style={styles.pillars}>
          {VALUE_PILLARS.map((pillar) => (
            <ValueCard key={pillar.title} pillar={pillar} />
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Cotizar un paseo" onPress={onQuotePress} />
          <Text style={styles.note}>Muy pronto podrás crear tu cuenta como dueño o paseador.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.lg,
  },
  hero: { alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 88,
    height: 88,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  logoText: { fontSize: 44 },
  brand: { ...typography.display, color: colors.primary },
  headline: { ...typography.title, color: colors.text, textAlign: 'center' },
  lead: { ...typography.body, maxWidth: 360, color: colors.muted, textAlign: 'center' },
  pillars: { gap: spacing.md },
  actions: { gap: spacing.md },
  note: { ...typography.caption, color: colors.muted, textAlign: 'center' },
});
