import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useVerifyLoginCode } from '../hooks/useAuth';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { challengeId: string; onVerified: () => void };

/** RF-005, step 2: the code emailed as a second factor opens the session (RNF-002). */
export function VerifyCodeScreen({ challengeId, onVerified }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.display, color: colors.text },
    lead: { ...typography.body, color: colors.muted },
    error: { ...typography.body, color: colors.danger },
  }));
  const [code, setCode] = useState('');
  const verifyLoginCode = useVerifyLoginCode();

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
