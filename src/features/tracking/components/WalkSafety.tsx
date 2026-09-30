import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/ui/theme';

import { useRaiseEmergency, useWalkAlerts } from '../hooks/useWalkAlerts';
import type { AlertParty } from '../model/alerts';
import { AlertBanner } from './AlertBanner';
import { EmergencyButton } from './EmergencyButton';

type Props = { walkId: string; viewer: AlertParty };

/** RF-012: latest alert of the walk and the emergency button, for the owner and the walker alike. */
export function WalkSafety({ walkId, viewer }: Props) {
  const alerts = useWalkAlerts(walkId);
  const raise = useRaiseEmergency(walkId);
  const latest = alerts.data?.[0];

  return (
    <View style={styles.container}>
      {latest && <AlertBanner alert={latest} viewer={viewer} />}
      <EmergencyButton onConfirm={() => raise.mutate()} sending={raise.isPending} />
      {raise.isSuccess && <Text style={styles.sent}>Emergencia enviada. Mantén la calma; el paseo quedó marcado.</Text>}
      {raise.isError && <Text style={styles.error}>No pudimos enviar la emergencia. Intenta de nuevo.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  sent: { ...typography.caption, fontWeight: '700', color: colors.text },
  error: { ...typography.caption, color: colors.danger },
});
