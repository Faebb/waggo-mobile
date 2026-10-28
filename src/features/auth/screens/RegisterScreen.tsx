import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { GoogleSignInButton } from '@/shared/auth/GoogleSignInButton';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { PasswordRules } from '../components/PasswordRules';
import { useGoogleLogin, useRegister } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';
import { meetsPasswordRules } from '../model/passwordRules';

type Props = {
  onRegistered: (email: string) => void;
  /** Signing up with Google needs no email code: the session opens right away. */
  onLoggedIn: () => void;
};

/**
 * RF-001: anyone creates an account; it stays inactive until the confirmation email is answered. Design proposal
 * screen 3: the password rules are checked live and "Crear cuenta" waits until they are all met.
 */
export function RegisterScreen({ onRegistered, onLoggedIn }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    password: { gap: spacing.sm },
    legal: { ...typography.caption, color: colors.muted },
  }));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();
  const googleLogin = useGoogleLogin();

  function submit() {
    register.mutate({ email, password }, { onSuccess: (account) => onRegistered(account.email) });
  }

  function signUpWithGoogle(idToken: string) {
    googleLogin.mutate(idToken, { onSuccess: onLoggedIn });
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Crea tu cuenta" subtitle="Una sola cuenta para pedir paseos o pasear." />

        <View style={styles.content}>
          {[
            ...apiErrorMessages(register.error, register.isError),
            ...apiErrorMessages(
              googleLogin.error,
              googleLogin.isError,
              'No pudimos crear tu cuenta con Google. Intenta de nuevo.',
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
            editable={!register.isPending}
          />
          <View style={styles.password}>
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!register.isPending}
            />
            <PasswordRules password={password} />
          </View>

          <GoogleSignInButton onIdToken={signUpWithGoogle} />

          <Text style={styles.legal}>Al crear tu cuenta aceptas los Términos y la Política de privacidad.</Text>
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label="Crear cuenta"
          loadingLabel="Creando cuenta…"
          loading={register.isPending}
          disabled={email.trim().length === 0 || !meetsPasswordRules(password)}
          onPress={submit}
        />
      </ActionFooter>
    </View>
  );
}
