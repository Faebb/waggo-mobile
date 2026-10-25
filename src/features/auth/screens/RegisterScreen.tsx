import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useRegister } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { onRegistered: (email: string) => void };

/** RF-001: anyone creates an account; it stays inactive until the confirmation email is answered. */
export function RegisterScreen({ onRegistered }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    error: { ...typography.body, color: colors.danger },
  }));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();

  function submit() {
    register.mutate({ email, password }, { onSuccess: (account) => onRegistered(account.email) });
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Crea tu cuenta" subtitle="Pide paseos o, cuando quieras, sé paseador" />

        <View style={styles.content}>
          <Text style={styles.lead}>Con un dueño registrado puedes pedir paseos o, cuando quieras, ser paseador.</Text>

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
            autoComplete="new-password"
            hint="Al menos 8 caracteres, con una mayúscula y un número."
          />

          {apiErrorMessages(register.error, register.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label={register.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
          onPress={submit}
          disabled={register.isPending}
        />
      </ActionFooter>
    </View>
  );
}
