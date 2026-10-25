import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useConfirmEmail } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { email: string; onConfirmed: () => void };

/** RF-001: the owner of the inbox pastes the token Waggo emailed to activate the account. */
export function ConfirmScreen({ email, onConfirmed }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    highlight: { color: colors.text, fontWeight: '700' },
    error: { ...typography.body, color: colors.danger },
  }));
  const [token, setToken] = useState('');
  const confirmEmail = useConfirmEmail();

  function submit() {
    confirmEmail.mutate(token, { onSuccess: onConfirmed });
  }

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthHeader title="Confirma tu correo" />

        <View style={styles.content}>
          <Text style={styles.lead}>
            Te escribimos a <Text style={styles.highlight}>{email}</Text> con un enlace de confirmación. Pégalo aquí.
          </Text>

          <TextField label="Enlace de confirmación" value={token} onChangeText={setToken} autoCapitalize="none" />

          {apiErrorMessages(confirmEmail.error, confirmEmail.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </View>
      </ScrollView>

      <ActionFooter>
        <Button
          label={confirmEmail.isPending ? 'Confirmando…' : 'Confirmar cuenta'}
          onPress={submit}
          disabled={confirmEmail.isPending || token.length === 0}
        />
      </ActionFooter>
    </View>
  );
}
