import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { colors, spacing, typography } from '@/shared/ui/theme';

type Props = { onConfirm: () => void; sending: boolean };

/** RF-012: red emergency button with a confirmation step, so a pocket tap does not raise a false alarm. */
export function EmergencyButton({ onConfirm, sending }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return <Button label="Emergencia" variant="danger" onPress={() => setConfirming(true)} />;
  }

  return (
    <View style={styles.confirm}>
      <Text style={styles.question}>¿Es una emergencia? Avisaremos a la otra persona del paseo.</Text>
      <Button
        label={sending ? 'Enviando…' : 'Sí, es una emergencia'}
        variant="danger"
        disabled={sending}
        onPress={() => {
          onConfirm();
          setConfirming(false);
        }}
      />
      <Button label="No, volver" variant="secondary" onPress={() => setConfirming(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  confirm: { gap: spacing.sm },
  question: { ...typography.body, color: colors.text },
});
