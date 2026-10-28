import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/shared/api/ApiError';
import { SocialSignIn } from '@/shared/auth/SocialSignIn';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, sizes, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useGoogleLogin, useLogin, useMicrosoftLogin, useResendConfirmation } from '../hooks/useAuth';
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

/**
 * RF-005: a right password and a confirmed account open the session right away (ADR-017, no second factor).
 * Design proposal screen 2. On the web there are also the Google and Microsoft buttons (ADR-017).
 */
export function LoginScreen({ onLoggedIn, onGoToRegister, onGoToForgotPassword, onAccountNotConfirmed }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    forgot: { alignSelf: 'flex-end', minHeight: sizes.touch, justifyContent: 'center' },
    forgotText: { ...typography.caption, fontWeight: '700', color: colors.primary },
  }));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const microsoftLogin = useMicrosoftLogin();
  const resendConfirmation = useResendConfirmation();

  function submit() {
    login.mutate({ email, password }, { onSuccess: onLoggedIn, onError: handleLoginError });
  }

  function signInWithGoogle(idToken: string) {
    googleLogin.mutate(idToken, { onSuccess: onLoggedIn });
  }

  function signInWithMicrosoft(idToken: string) {
    microsoftLogin.mutate(idToken, { onSuccess: onLoggedIn });
  }

  function handleLoginError(error: Error) {
    if (!(error instanceof ApiError) || error.code !== ACCOUNT_NOT_CONFIRMED) return;
    // Best effort: if the new code cannot be requested, the confirm screen still lets the person ask again.
    resendConfirmation.mutate(email, { onSettled: () => onAccountNotConfirmed(email) });
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Inicia sesión" subtitle="Sigue el paseo de tu perro en vivo." />

        <View style={styles.content}>
          {[
            ...apiErrorMessages(login.error, login.isError, 'Correo o contraseña incorrectos.'),
            ...apiErrorMessages(
              googleLogin.error,
              googleLogin.isError,
              'No pudimos iniciar sesión con Google. Intenta de nuevo.',
            ),
            ...apiErrorMessages(
              microsoftLogin.error,
              microsoftLogin.isError,
              'No pudimos iniciar sesión con Microsoft. Intenta de nuevo.',
            ),
          ].map((message) => (
            <Banner key={message} tone="danger" message={message} />
          ))}

          <TextField
            label="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!login.isPending}
          />
          <View>
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              editable={!login.isPending}
            />
            <Pressable accessibilityRole="button" onPress={() => onGoToForgotPassword(email)} style={styles.forgot}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          <SocialSignIn onGoogleIdToken={signInWithGoogle} onMicrosoftIdToken={signInWithMicrosoft} />
        </View>
      </ScrollView>

      <ActionFooter>
        <Button label="Entrar" loadingLabel="Entrando…" loading={login.isPending} onPress={submit} />
        <Button label="¿No tienes cuenta? Crear cuenta" variant="tertiary" onPress={onGoToRegister} />
      </ActionFooter>
    </View>
  );
}
