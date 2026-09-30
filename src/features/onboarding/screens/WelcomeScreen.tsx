import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { colors, layout, radius, spacing, typography } from '@/shared/ui/theme';

import { ValueCard } from '../components/ValueCard';
import { VALUE_PILLARS } from '../model/valuePillars';

type Props = { onStart: () => void };

/** UX-001: first screen of the app. Presents Waggo and leads to the owner home. */
export function WelcomeScreen({ onStart }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.column}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark} />
            <Text style={styles.brand}>Waggo</Text>
          </View>

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
          <Button label="Empezar" onPress={onStart} />
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 16, height: 16, borderRadius: radius.sm, backgroundColor: colors.primary },
  brand: { ...typography.subtitle, color: colors.text },
  hero: { gap: spacing.md, paddingTop: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  headline: { ...typography.display, color: colors.text },
  highlight: { color: colors.primary },
  lead: { ...typography.body, color: colors.muted },
  note: { ...typography.caption, color: colors.muted, textAlign: 'center' },
});
