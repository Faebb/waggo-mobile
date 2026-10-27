import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useForgotPassword } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { initialEmail: string; onCodeSent: (email: string) => void };

/** RF-001, RF-005: asks for a 6-digit code by email to set a new password. */
export function ForgotPasswordScreen({ initialEmail, onCodeSent }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    error: { ...typography.body, color: colors.danger },
  }));
  const [email, setEmail] = useState(initialEmail);
  const forgotPassword = useForgotPassword();

  function submit() {
    const trimmed = email.trim();
    forgotPassword.mutate(trimmed, { onSuccess: () => onCodeSent(trimmed) });
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Recupera tu contraseña" />

        <View style={styles.content}>
          <Text style={styles.lead}>
            Escribe el correo de tu cuenta. Si existe, te enviamos un código de 6 números para elegir una contraseña
            nueva.
          </Text>

          <TextField
            label="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {apiErrorMessages(forgotPassword.error, forgotPassword.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label={forgotPassword.isPending ? 'Enviando…' : 'Enviar código'}
          onPress={submit}
          disabled={forgotPassword.isPending || email.trim().length === 0}
        />
      </ActionFooter>
    </View>
  );
}
