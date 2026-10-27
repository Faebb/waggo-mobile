import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useForgotPassword, useResetPassword } from '../hooks/useAuth';
import { useResendCountdown } from '../hooks/useResendCountdown';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { email: string; onReset: () => void };

const CODE_LENGTH = 6;
/** Same wait the API enforces between two recovery emails. */
const RESEND_WAIT_SECONDS = 60;

/** RF-001, RF-005: the code from the email plus a new password; every open session is closed. */
export function ResetPasswordScreen({ email, onReset }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    highlight: { color: colors.text, fontWeight: '700' },
    info: { ...typography.body, color: colors.success },
    error: { ...typography.body, color: colors.danger },
  }));
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [repeated, setRepeated] = useState('');
  const resetPassword = useResetPassword();
  const askAgain = useForgotPassword();
  const countdown = useResendCountdown(RESEND_WAIT_SECONDS);

  const mismatch = repeated.length > 0 && repeated !== password;
  const ready = code.length === CODE_LENGTH && password.length > 0 && repeated === password;

  function submit() {
    resetPassword.mutate({ email, code, newPassword: password }, { onSuccess: onReset });
  }

  function resend() {
    askAgain.mutate(email, { onSuccess: countdown.restart });
  }

  function resendLabel() {
    if (countdown.waiting) return `Pedir otro código en ${countdown.secondsLeft} s`;
    return askAgain.isPending ? 'Enviando…' : 'Pedir otro código';
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Elige una contraseña nueva" />

        <View style={styles.content}>
          <Text style={styles.lead}>
            Si <Text style={styles.highlight}>{email}</Text> tiene una cuenta, le escribimos un código de {CODE_LENGTH}{' '}
            números. Escríbelo aquí con tu contraseña nueva.
          </Text>

          <TextField
            label="Código de recuperación"
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoComplete="one-time-code"
            hint="El código vence en 15 minutos."
          />
          <TextField
            label="Contraseña nueva"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            hint="Al menos 8 caracteres, con una mayúscula y un número."
          />
          <TextField
            label="Repite la contraseña nueva"
            value={repeated}
            onChangeText={setRepeated}
            secureTextEntry
            autoComplete="new-password"
            error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
          />

          {apiErrorMessages(resetPassword.error, resetPassword.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
          {askAgain.isSuccess && <Text style={styles.info}>Te enviamos un código nuevo.</Text>}
          {apiErrorMessages(askAgain.error, askAgain.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label={resetPassword.isPending ? 'Cambiando…' : 'Cambiar contraseña'}
          onPress={submit}
          disabled={resetPassword.isPending || !ready}
        />
        <Button
          label={resendLabel()}
          variant="secondary"
          onPress={resend}
          disabled={countdown.waiting || askAgain.isPending}
        />
      </ActionFooter>
    </View>
  );
}
