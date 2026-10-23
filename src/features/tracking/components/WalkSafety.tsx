import { Text, View } from 'react-native';

import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useRaiseEmergency, useWalkAlerts } from '../hooks/useWalkAlerts';
import type { AlertParty } from '../model/alerts';
import { AlertBanner } from './AlertBanner';
import { EmergencyButton } from './EmergencyButton';

type Props = { walkId: string; viewer: AlertParty };

/** RF-012: the alerts of the walk (as the API orders them, newest first) and the emergency button, for the owner and the walker alike. */
export function WalkSafety({ walkId, viewer }: Props) {
  const alerts = useWalkAlerts(walkId);
  const raise = useRaiseEmergency(walkId);
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.md },
    sent: { ...typography.caption, fontWeight: '700', color: colors.text },
    error: { ...typography.caption, color: colors.danger },
  }));

  return (
    <View style={styles.container}>
      {alerts.data?.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} viewer={viewer} />
      ))}
      <EmergencyButton onConfirm={(message) => raise.mutate(message)} sending={raise.isPending} />
      {raise.isSuccess && <Text style={styles.sent}>Emergencia enviada. Mantén la calma; el paseo quedó marcado.</Text>}
      {raise.isError && <Text style={styles.error}>No pudimos enviar la emergencia. Intenta de nuevo.</Text>}
    </View>
  );
}
