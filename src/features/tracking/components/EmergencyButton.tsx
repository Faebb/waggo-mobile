import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

/** Longest message the API accepts (RF-012). */
export const EMERGENCY_MESSAGE_MAX_LENGTH = 500;

type Props = { onConfirm: (message?: string) => void; sending: boolean };

/** RF-012: red emergency button with a confirmation step, so a pocket tap does not raise a false alarm. */
export function EmergencyButton({ onConfirm, sending }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const styles = useThemedStyles((colors) => ({
    confirm: { gap: spacing.sm },
    question: { ...typography.body, color: colors.text },
  }));

  if (!confirming) {
    return <Button label="Emergencia" variant="danger" onPress={() => setConfirming(true)} />;
  }

  return (
    <View style={styles.confirm}>
      <Text style={styles.question}>¿Es una emergencia? Avisaremos a la otra persona del paseo.</Text>
      <TextField
        label="Mensaje"
        value={message}
        onChangeText={setMessage}
        hint="Opcional. Cuenta qué pasó, hasta 500 caracteres."
        multiline
        maxLength={EMERGENCY_MESSAGE_MAX_LENGTH}
      />
      <Button
        label={sending ? 'Enviando…' : 'Sí, es una emergencia'}
        variant="danger"
        disabled={sending}
        onPress={() => {
          onConfirm(message.trim() === '' ? undefined : message.trim());
          setMessage('');
          setConfirming(false);
        }}
      />
      <Button
        label="No, volver"
        variant="secondary"
        onPress={() => {
          setMessage('');
          setConfirming(false);
        }}
      />
    </View>
  );
}
