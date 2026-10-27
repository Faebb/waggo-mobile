import { Text, View } from 'react-native';

import type { WalkerProfile } from '@/features/walker';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { radius, shadows, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { formatPhone, formatTimeAgo } from '../model/format';

type Props = {
  profile: WalkerProfile;
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
  /** Another action of the queue is running: block this card too. */
  busy: boolean;
};

/**
 * One walker of the admin verification queue (RF-002/RF-003; design proposal 07 · 35): initial, name, how long ago
 * the profile was sent, masked document, phone, experience, "Rechazar" and "Aprobar".
 */
export function PendingWalkerCard({ profile, onApprove, onReject, approving, busy }: Props) {
  const styles = useThemedStyles((colors) => ({
    card: {
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    who: { flex: 1, gap: spacing.xs },
    name: { ...typography.body, fontWeight: '700', color: colors.text },
    caption: { ...typography.caption, color: colors.muted },
    facts: { flexDirection: 'row', gap: spacing.md },
    fact: { flex: 1, gap: spacing.xs },
    label: { ...typography.micro, color: colors.muted },
    value: { ...typography.body, color: colors.text },
    experience: { ...typography.caption, color: colors.text },
    actions: { flexDirection: 'row', gap: spacing.sm },
    action: { flex: 1 },
  }));
  const blocked = approving || busy;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar label={profile.fullName} size={44} />
        <View style={styles.who}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.caption}>Enviado {formatTimeAgo(profile.registeredAt)}</Text>
        </View>
      </View>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Text style={styles.label}>Documento</Text>
          <Text style={styles.value}>
            {profile.documentType} •••• {profile.documentLast4}
          </Text>
        </View>
        <View style={styles.fact}>
          <Text style={styles.label}>Celular</Text>
          <Text style={styles.value}>{formatPhone(profile.phone)}</Text>
        </View>
      </View>
      {profile.experience !== null && <Text style={styles.experience}>“{profile.experience}”</Text>}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Rechazar" variant="secondary" onPress={onReject} disabled={blocked} />
        </View>
        <View style={styles.action}>
          <Button label="Aprobar" loading={approving} loadingLabel="Aprobando…" onPress={onApprove} disabled={busy} />
        </View>
      </View>
    </View>
  );
}
