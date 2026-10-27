import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useConfirmEmailChange, useRequestEmailChange } from '../hooks/useProfile';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { onChanged: () => void };

const CODE_LENGTH = 6;

/**
 * RF-005: the signed-in account moves to another email in two steps — the new address and the password, then the
 * 6-digit code Waggo emailed to the NEW inbox. The email only changes once the code is typed.
 */
export function ChangeEmailScreen({ onChanged }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    highlight: { color: colors.text, fontWeight: '700' },
    error: { ...typography.body, color: colors.danger },
  }));
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const requestChange = useRequestEmailChange();
  const confirmChange = useConfirmEmailChange();

  function askForTheCode() {
    const trimmed = newEmail.trim();
    requestChange.mutate({ newEmail: trimmed, password }, { onSuccess: () => setCodeSent(true) });
  }

  function confirm() {
    confirmChange.mutate(code, { onSuccess: onChanged });
  }

  function useAnotherEmail() {
    setCodeSent(false);
    setCode('');
    confirmChange.reset();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={typography.eyebrow}>
            CAMBIAR CORREO
          </Text>

          {codeSent ? (
            <>
              <Text style={styles.lead}>
                Te escribimos a <Text style={styles.highlight}>{newEmail.trim()}</Text> con un código de {CODE_LENGTH}{' '}
                números. Tu correo cambia cuando lo escribas aquí.
              </Text>
              <TextField
                label="Código de confirmación"
                value={code}
                onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                autoComplete="one-time-code"
                hint="El código vence en 15 minutos."
              />
              {apiErrorMessages(confirmChange.error, confirmChange.isError).map((message) => (
                <Text key={message} accessibilityRole="alert" style={styles.error}>
                  {message}
                </Text>
              ))}
            </>
          ) : (
            <>
              <Text style={styles.lead}>
                Escribe el correo nuevo y tu contraseña. Te mandamos un código al correo nuevo para comprobar que es
                tuyo.
              </Text>
              <TextField
                label="Correo nuevo"
                value={newEmail}
                onChangeText={setNewEmail}
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
              {apiErrorMessages(requestChange.error, requestChange.isError).map((message) => (
                <Text key={message} accessibilityRole="alert" style={styles.error}>
                  {message}
                </Text>
              ))}
            </>
          )}
        </ScrollView>

        <ActionFooter>
          {codeSent ? (
            <>
              <Button
                label={confirmChange.isPending ? 'Confirmando…' : 'Confirmar correo'}
                onPress={confirm}
                disabled={confirmChange.isPending || code.length !== CODE_LENGTH}
              />
              <Button label="Usar otro correo" variant="secondary" onPress={useAnotherEmail} />
            </>
          ) : (
            <Button
              label={requestChange.isPending ? 'Enviando…' : 'Enviar código'}
              onPress={askForTheCode}
              disabled={requestChange.isPending || newEmail.trim().length === 0 || password.length === 0}
            />
          )}
        </ActionFooter>
      </View>
    </SafeAreaView>
  );
}
