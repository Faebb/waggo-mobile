import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useLogin } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = {
  onLoggedIn: () => void;
  onGoToRegister: () => void;
  /** Receives the email typed so far, so the recovery screen starts with it. */
  onGoToForgotPassword: (email: string) => void;
};

/** RF-005: a right password and a confirmed account open the session right away (ADR-017, no second factor). */
export function LoginScreen({ onLoggedIn, onGoToRegister, onGoToForgotPassword }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    error: { ...typography.body, color: colors.danger },
    link: { ...typography.body, color: colors.primary, textAlign: 'center' },
  }));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function submit() {
    login.mutate({ email, password }, { onSuccess: onLoggedIn });
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
