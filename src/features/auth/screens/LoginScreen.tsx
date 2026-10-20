import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useLogin } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { onCodeSent: (challengeId: string) => void; onGoToRegister: () => void };

/** RF-005, step 1: the right password raises the second factor instead of a session right away. */
export function LoginScreen({ onCodeSent, onGoToRegister }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.display, color: colors.text },
    error: { ...typography.body, color: colors.danger },
    link: { ...typography.body, color: colors.primary, textAlign: 'center' },
  }));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function submit() {
    login.mutate({ email, password }, { onSuccess: (challenge) => onCodeSent(challenge.challengeId) });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Inicia sesión
        </Text>

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

        <Text accessibilityRole="button" onPress={onGoToRegister} style={styles.link}>
          ¿Nuevo en Waggo? Crea tu cuenta
        </Text>
      </ScrollView>

      <ActionFooter>
        <Button label={login.isPending ? 'Entrando…' : 'Entrar'} onPress={submit} disabled={login.isPending} />
      </ActionFooter>
    </View>
  );
}
