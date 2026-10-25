import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { WalkerProfile } from '@/features/walker';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { TextField } from '@/shared/ui/TextField';
import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

type Props = {
  profile: WalkerProfile;
  onApprove: () => void;
  onReject: (reason: string) => void;
  approving: boolean;
  rejecting: boolean;
};

/** One row of the admin verification queue: details plus approve/reject (RF-002/RF-003). */
export function PendingWalkerCard({ profile, onApprove, onReject, approving, rejecting }: Props) {
  const styles = useThemedStyles((colors) => ({
    card: {
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    name: { ...typography.subtitle, color: colors.text },
    actions: { flexDirection: 'row', gap: spacing.sm },
    action: { flex: 1 },
  }));
  const [rejecting_, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (rejecting_) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{profile.fullName}</Text>
        <TextField label="Motivo del rechazo" value={reason} onChangeText={setReason} multiline maxLength={300} />
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button label="Cancelar" variant="secondary" onPress={() => setRejecting(false)} disabled={rejecting} />
          </View>
          <View style={styles.action}>
            <Button
              label={rejecting ? 'Rechazando…' : 'Confirmar rechazo'}
              variant="danger"
              onPress={() => onReject(reason)}
              disabled={rejecting || reason.trim().length === 0}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{profile.fullName}</Text>
      <DetailRow label="Documento" value={`${profile.documentType} ···· ${profile.documentLast4}`} />
      <DetailRow label="Celular" value={profile.phone} />
      {profile.experience !== null && <DetailRow label="Experiencia" value={profile.experience} />}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label="Rechazar"
            variant="danger"
            onPress={() => setRejecting(true)}
            disabled={approving || rejecting}
          />
        </View>
        <View style={styles.action}>
          <Button label={approving ? 'Aprobando…' : 'Aprobar'} onPress={onApprove} disabled={approving || rejecting} />
        </View>
      </View>
    </View>
  );
}
