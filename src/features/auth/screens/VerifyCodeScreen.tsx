import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useResendLoginCode, useVerifyLoginCode } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { challengeId: string; email?: string; onVerified: () => void };

const RESEND_COOLDOWN_SECONDS = 30;

function formatCountdown(seconds: number): string {
  return `0:${String(seconds).padStart(2, '0')}`;
}

/** RF-005, step 2: the code emailed as a second factor opens the session (RNF-002). */
export function VerifyCodeScreen({ challengeId, email, onVerified }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    lead: { ...typography.body, color: colors.muted },
    confirmation: { ...typography.body, color: colors.success },
    error: { ...typography.body, color: colors.danger },
  }));
  const [code, setCode] = useState('');
  const verifyLoginCode = useVerifyLoginCode();
  const resendLoginCode = useResendLoginCode();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resent, setResent] = useState(false);
  const cooling = secondsLeft > 0;

  useEffect(() => {
    if (!cooling) return;
    const timer = setInterval(() => setSecondsLeft((seconds) => Math.max(seconds - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [cooling]);

  function resend() {
    setResent(false);
    resendLoginCode.mutate(challengeId, {
      onSuccess: () => {
        setResent(true);
        setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      },
    });
  }

  function submit() {
    verifyLoginCode.mutate({ challengeId, code }, { onSuccess: onVerified });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Verifica tu identidad
        </Text>
        <Text style={styles.lead}>Te enviamos un código de 6 dígitos por correo.</Text>

        <TextField
          label="Código"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
        />

        <Button
          label={
            resendLoginCode.isPending
              ? 'Reenviando…'
              : cooling
                ? `Reenviar en ${formatCountdown(secondsLeft)}`
                : 'Reenviar código'
          }
          variant="secondary"
          onPress={resend}
          disabled={resendLoginCode.isPending || cooling}
        />

        {resent ? (
          <Text accessibilityRole="alert" style={styles.confirmation}>
            {email ? `Te enviamos un código nuevo a ${email}.` : 'Te enviamos un código nuevo.'}
          </Text>
        ) : null}

        {apiErrorMessages(resendLoginCode.error, resendLoginCode.isError, 'No pudimos reenviar el código.').map(
          (message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ),
        )}

        {apiErrorMessages(verifyLoginCode.error, verifyLoginCode.isError, 'El código no es correcto.').map(
          (message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ),
        )}
      </ScrollView>

      <ActionFooter>
        <Button
          label={verifyLoginCode.isPending ? 'Verificando…' : 'Verificar'}
          onPress={submit}
          disabled={verifyLoginCode.isPending || code.length === 0}
        />
      </ActionFooter>
    </View>
  );
}
