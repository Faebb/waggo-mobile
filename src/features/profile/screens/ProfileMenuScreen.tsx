import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '@/features/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { Shortcut } from '@/shared/ui/Shortcut';
import { layout, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile } from '../hooks/useProfile';

type Props = {
  onOpenPersonalInfo: () => void;
  onOpenPets: () => void;
  onOpenWalks: () => void;
  onOpenNotifications: () => void;
  onLoggedOut: () => void;
};

/** Perfil de usuario: entry point to the account, like the "Menu" screen of the reference the user shared. */
export function ProfileMenuScreen({
  onOpenPersonalInfo,
  onOpenPets,
  onOpenWalks,
  onOpenNotifications,
  onLoggedOut,
}: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    name: { ...typography.title, color: colors.text },
    email: { ...typography.body, color: colors.muted },
    section: { gap: 0 },
  }));
  const profile = useMyProfile();

  function signOut() {
    logout();
    onLoggedOut();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <Text accessibilityRole="header" style={typography.eyebrow}>
          PERFIL
        </Text>

        {profile.isPending && <ActivityIndicator accessibilityLabel="Cargando tu perfil" color={colors.primary} />}
        {profile.data && (
          <View style={styles.header}>
            <Avatar label={profile.data.fullName ?? profile.data.email} />
            <View>
              <Text style={styles.name}>{profile.data.fullName ?? 'Agrega tu nombre'}</Text>
              <Text style={styles.email}>{profile.data.email}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Shortcut title="Información personal" detail="Nombre y celular" onPress={onOpenPersonalInfo} />
          <Shortcut title="Mis perros" detail="Ver y agregar perros" onPress={onOpenPets} />
          <Shortcut title="Mis paseos" detail="Historial y en curso" onPress={onOpenWalks} />
          <Shortcut title="Notificaciones" detail="Avisos del recorrido" onPress={onOpenNotifications} />
        </View>

        <View style={styles.section}>
          <Shortcut title="Cerrar sesión" detail="Vuelve a la pantalla de inicio" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
