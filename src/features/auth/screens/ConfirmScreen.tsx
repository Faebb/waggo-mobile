import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useConfirmEmail } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { email: string; onConfirmed: () => void };

/** RF-001: the owner of the inbox pastes the confirmation code Waggo emailed to activate the account. */
export function ConfirmScreen({ email, onConfirmed }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    lead: { ...typography.body, color: colors.muted },
    highlight: { color: colors.text, fontWeight: '700' },
    error: { ...typography.body, color: colors.danger },
    success: { ...typography.body, fontWeight: '700', color: colors.primary },
  }));
  const [token, setToken] = useState('');
  const confirmEmail = useConfirmEmail();

  function submit() {
    confirmEmail.mutate(token);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Confirma tu correo
        </Text>
        <Text style={styles.lead}>
          Te escribimos a <Text style={styles.highlight}>{email}</Text> con un código de confirmación. Escríbelo aquí.
        </Text>

        <TextField label="Código de confirmación" value={token} onChangeText={setToken} autoCapitalize="none" />

        {confirmEmail.isSuccess && (
          <Text accessibilityRole="alert" style={styles.success}>
            Correo confirmado. Ya puedes iniciar sesión.
          </Text>
        )}

        {apiErrorMessages(confirmEmail.error, confirmEmail.isError).map((message) => (
          <Text key={message} accessibilityRole="alert" style={styles.error}>
            {message}
          </Text>
        ))}
      </ScrollView>

      <ActionFooter>
        {confirmEmail.isSuccess ? (
          <Button label="Ir a iniciar sesión" onPress={onConfirmed} />
        ) : (
          <Button
            label={confirmEmail.isPending ? 'Confirmando…' : 'Confirmar cuenta'}
            onPress={submit}
            disabled={confirmEmail.isPending || token.length === 0}
          />
        )}
      </ActionFooter>
    </View>
  );
}
