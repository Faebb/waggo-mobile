import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextField } from '@/shared/ui/TextField';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile, useUpdateProfile } from '../hooks/useProfile';
import { apiErrorMessages } from '../model/apiErrorMessages';
import type { UserProfile } from '../model/types';

type Props = { onSaved: () => void };

/** Perfil de usuario: edits full name and phone, like "Edit Profile" of the reference the user shared. */
export function EditProfileScreen({ onSaved }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { alignItems: 'center', gap: spacing.xs },
    error: { ...typography.body, color: colors.danger },
  }));
  const profile = useMyProfile();

  if (profile.isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar tu perfil. Intenta de nuevo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile.data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Skeleton width={80} height={80} radius={radius.pill} />
            <Skeleton width={200} height={16} />
          </View>
          <Skeleton width="100%" height={56} />
          <Skeleton width="100%" height={56} />
        </View>
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
