import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/shared/api/ApiError';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useLogin, useResendConfirmation } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = {
  onLoggedIn: () => void;
  onGoToRegister: () => void;
  /** Receives the email typed so far, so the recovery screen starts with it. */
  onGoToForgotPassword: (email: string) => void;
  /** The password was right but the email was never confirmed: receives the email to confirm it. */
  onAccountNotConfirmed: (email: string) => void;
};

const ACCOUNT_NOT_CONFIRMED = 'Identity.AccountNotConfirmed';

/** RF-005: a right password and a confirmed account open the session right away (ADR-017, no second factor). */
export function LoginScreen({ onLoggedIn, onGoToRegister, onGoToForgotPassword, onAccountNotConfirmed }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    error: { ...typography.body, color: colors.danger },
    link: { ...typography.body, color: colors.primary, textAlign: 'center' },
  }));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const resendConfirmation = useResendConfirmation();

  function submit() {
    login.mutate({ email, password }, { onSuccess: onLoggedIn, onError: handleLoginError });
  }

  function handleLoginError(error: Error) {
    if (!(error instanceof ApiError) || error.code !== ACCOUNT_NOT_CONFIRMED) return;
    // Best effort: if the new code cannot be requested, the confirm screen still lets the person ask again.
    resendConfirmation.mutate(email, { onSettled: () => onAccountNotConfirmed(email) });
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Inicia sesión" subtitle="Sigue el paseo de tu perro en vivo" />

        <View style={styles.content}>
          <TextField
            label="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          {apiErrorMessages(login.error, login.isError, 'Correo o contraseña incorrectos.').map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}

          <Text accessibilityRole="button" onPress={() => onGoToForgotPassword(email)} style={styles.link}>
            ¿Olvidaste tu contraseña?
          </Text>
          <Text accessibilityRole="button" onPress={onGoToRegister} style={styles.link}>
            ¿Nuevo en Waggo? Crea tu cuenta
          </Text>
        </View>
      </ScrollView>

      <ActionFooter>
        <Button label={login.isPending ? 'Entrando…' : 'Entrar'} onPress={submit} disabled={login.isPending} />
      </ActionFooter>
    </View>
  );
}
