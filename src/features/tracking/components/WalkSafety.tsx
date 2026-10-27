import { View } from 'react-native';

import { Banner } from '@/shared/ui/Banner';
import { spacing, useThemedStyles } from '@/shared/ui/theme';

import { useRaiseEmergency, useWalkAlerts } from '../hooks/useWalkAlerts';
import type { AlertParty } from '../model/alerts';
import { AlertBanner } from './AlertBanner';
import { EmergencyButton } from './EmergencyButton';

type Props = {
  walkId: string;
  viewer: AlertParty;
  /** Chat with the other person, offered once the emergency is sent. */
  onOpenChat?: () => void;
};

/**
 * RF-012: latest alert of the walk and the emergency button with its confirmation sheet, for the owner and the
 * walker alike (design proposal 07 · 21). A failed send keeps a "Reintentar" with the same message.
 */
export function WalkSafety({ walkId, viewer, onOpenChat }: Props) {
  const alerts = useWalkAlerts(walkId);
  const raise = useRaiseEmergency(walkId);
  const latest = alerts.data?.[0];
  const styles = useThemedStyles(() => ({ container: { gap: spacing.md } }));

  return (
    <View style={styles.container}>
      {latest && <AlertBanner alert={latest} viewer={viewer} />}
      {raise.isSuccess && (
        <Banner tone="danger" title="Emergencia enviada" message="Mantén la calma; el paseo quedó marcado." />
      )}
      <EmergencyButton
        viewer={viewer}
        status={raise.status}
        onConfirm={(message) => raise.mutate(message)}
        onOpen={raise.reset}
        onOpenChat={onOpenChat}
      />
    </View>
  );
}
