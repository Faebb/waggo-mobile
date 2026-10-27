import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useConfirmEmail, useResendConfirmation } from '../hooks/useAuth';
import { useResendCountdown } from '../hooks/useResendCountdown';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { email: string; onConfirmed: () => void };

const CODE_LENGTH = 6;
/** Same wait the API enforces between two confirmation emails. */
const RESEND_WAIT_SECONDS = 60;

/** RF-001: the owner of the inbox types the 6-digit code Waggo emailed to activate the account. */
export function ConfirmScreen({ email, onConfirmed }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    highlight: { color: colors.text, fontWeight: '700' },
    info: { ...typography.body, color: colors.success },
    error: { ...typography.body, color: colors.danger },
  }));
  const [code, setCode] = useState('');
  const confirmEmail = useConfirmEmail();
  const resendConfirmation = useResendConfirmation();
  // A code was just emailed, so the next one can only be requested after the wait.
  const { secondsLeft, waiting, restart } = useResendCountdown(RESEND_WAIT_SECONDS);

  function submit() {
    confirmEmail.mutate({ email, code }, { onSuccess: onConfirmed });
  }

  function resend() {
    resendConfirmation.mutate(email, { onSuccess: restart });
  }

  function resendLabel() {
    if (waiting) return `Reenviar código en ${secondsLeft} s`;
    return resendConfirmation.isPending ? 'Enviando…' : 'Reenviar código';
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Confirma tu correo" />

        <View style={styles.content}>
          <Text style={styles.lead}>
            Te escribimos a <Text style={styles.highlight}>{email}</Text> con un código de {CODE_LENGTH} números.
            Escríbelo aquí.
          </Text>

          <TextField
            label="Código de confirmación"
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoComplete="one-time-code"
            hint="El código vence en 30 minutos."
          />

          {apiErrorMessages(confirmEmail.error, confirmEmail.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
          {resendConfirmation.isSuccess && <Text style={styles.info}>Te enviamos un código nuevo.</Text>}
          {apiErrorMessages(resendConfirmation.error, resendConfirmation.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label={confirmEmail.isPending ? 'Confirmando…' : 'Confirmar cuenta'}
          onPress={submit}
          disabled={confirmEmail.isPending || code.length !== CODE_LENGTH}
        />
        <Button
          label={resendLabel()}
          variant="secondary"
          onPress={resend}
          disabled={waiting || resendConfirmation.isPending}
        />
      </ActionFooter>
    </View>
  );
}
