import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { layout, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile, useUpdateProfile } from '../hooks/useProfile';
import { apiErrorMessages } from '../model/apiErrorMessages';
import type { UserProfile } from '../model/types';

type Props = { onSaved: () => void };

/** Perfil de usuario: edits full name and phone, like "Edit Profile" of the reference the user shared. */
export function EditProfileScreen({ onSaved }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({ safeArea: { flex: 1, backgroundColor: colors.background } }));
  const profile = useMyProfile();

  if (!profile.data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator accessibilityLabel="Cargando tu perfil" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return <ProfileForm profile={profile.data} onSaved={onSaved} />;
}

/**
 * Mounted only once `profile` is loaded, so `useState`'s lazy initializer seeds the fields with it — no effect
 * needed to copy server data into local state.
 */
function ProfileForm({ profile, onSaved }: { profile: UserProfile; onSaved: () => void }) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { alignItems: 'center', gap: spacing.xs },
    email: { ...typography.body, color: colors.muted },
    error: { ...typography.body, color: colors.danger },
  }));
  const update = useUpdateProfile();
  const [fullName, setFullName] = useState(profile.fullName ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');

  function save() {
    update.mutate({ fullName: fullName.trim() || null, phone: phone.trim() || null }, { onSuccess: onSaved });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={typography.eyebrow}>
            EDITAR PERFIL
          </Text>

          <View style={styles.header}>
            <Avatar label={fullName || profile.email} size={80} />
            <Text style={styles.email}>{profile.email}</Text>
          </View>

          <TextField label="Nombre completo" value={fullName} onChangeText={setFullName} maxLength={100} />
          <TextField label="Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} />

          {apiErrorMessages(update.error, update.isError).map((message) => (
            <Text key={message} accessibilityRole="alert" style={styles.error}>
              {message}
            </Text>
          ))}
        </ScrollView>

        <ActionFooter>
          <Button label={update.isPending ? 'Guardando…' : 'Guardar'} onPress={save} disabled={update.isPending} />
        </ActionFooter>
      </View>
    </SafeAreaView>
  );
}
