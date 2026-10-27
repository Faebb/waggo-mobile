import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useChangePassword } from '../hooks/useProfile';
import { apiErrorMessages } from '../model/apiErrorMessages';

type Props = { onChanged: () => void };

/** RF-005: the signed-in account changes its password; this session stays open and the others are closed. */
export function ChangePasswordScreen({ onChanged }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    lead: { ...typography.body, color: colors.muted },
    error: { ...typography.body, color: colors.danger },
  }));
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [repeated, setRepeated] = useState('');
  const changePassword = useChangePassword();

  const mismatch = repeated.length > 0 && repeated !== password;
  const ready = current.length > 0 && password.length > 0 && repeated === password;

  function submit() {
    changePassword.mutate({ currentPassword: current, newPassword: password }, { onSuccess: onChanged });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={typography.eyebrow}>
            CAMBIAR CONTRASEÑA
          </Text>
          <Text style={styles.lead}>
            Al cambiarla cerramos tus sesiones en otros dispositivos y te avisamos por correo.
          </Text>

          <TextField
            label="Contraseña actual"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoComplete="current-password"
          />
          <TextField
            label="Contraseña nueva"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            hint="Al menos 8 caracteres, con una mayúscula y un número."
          />
          <TextField
            label="Repite la contraseña nueva"
            value={repeated}
            onChangeText={setRepeated}
            secureTextEntry
            autoComplete="new-password"
            error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
          />

          {apiErrorMessages(changePassword.error, changePassword.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </ScrollView>

        <ActionFooter>
          <Button
            label={changePassword.isPending ? 'Cambiando…' : 'Cambiar contraseña'}
            onPress={submit}
            disabled={changePassword.isPending || !ready}
          />
        </ActionFooter>
      </View>
    </SafeAreaView>
  );
}
