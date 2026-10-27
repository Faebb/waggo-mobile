import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '@/features/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { Shortcut } from '@/shared/ui/Shortcut';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile } from '../hooks/useProfile';

type Props = {
  onOpenPersonalInfo: () => void;
  /** Owner only: the walker's dogs and walks already show on their own home screen. */
  onOpenPets?: () => void;
  onOpenWalks?: () => void;
  onOpenNotifications: () => void;
  onOpenChangePassword: () => void;
  onOpenChangeEmail: () => void;
  onLoggedOut: () => void;
};

/** Configuración: account settings for both roles, with the profile summary as its first entry. */
export function SettingsScreen({
  onOpenPersonalInfo,
  onOpenPets,
  onOpenWalks,
  onOpenNotifications,
  onOpenChangePassword,
  onOpenChangeEmail,
  onLoggedOut,
}: Props) {
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
    headerText: { gap: spacing.xs },
    name: { ...typography.title, color: colors.text },
    email: { ...typography.body, color: colors.muted },
    error: { ...typography.body, color: colors.danger },
    section: { gap: 0 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    rowTitle: { ...typography.subtitle, color: colors.text },
  }));
  const profile = useMyProfile();

  function signOut() {
    void logout();
    onLoggedOut();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <Text accessibilityRole="header" style={typography.eyebrow}>
          CONFIGURACIÓN
        </Text>

        {profile.isPending && (
          <View style={styles.header}>
            <Skeleton width={64} height={64} radius={radius.pill} />
            <View style={styles.headerText}>
              <Skeleton width={140} height={20} />
              <Skeleton width={180} height={16} />
            </View>
          </View>
        )}
        {profile.data && (
          <View style={styles.header}>
            <Avatar label={profile.data.fullName ?? profile.data.email} />
            <View>
              <Text style={styles.name}>{profile.data.fullName ?? 'Agrega tu nombre'}</Text>
              <Text style={styles.email}>{profile.data.email}</Text>
            </View>
          </View>
        )}
        {profile.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar tu perfil. Intenta de nuevo.
          </Text>
        )}

        <View style={styles.section}>
          <Shortcut title="Información personal" detail="Nombre y celular" onPress={onOpenPersonalInfo} />
          {onOpenPets && <Shortcut title="Mis perros" detail="Ver y agregar perros" onPress={onOpenPets} />}
          {onOpenWalks && <Shortcut title="Mis paseos" detail="Historial y en curso" onPress={onOpenWalks} />}
          <Shortcut title="Notificaciones" detail="Avisos del recorrido" onPress={onOpenNotifications} />
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Tema</Text>
            <ThemeToggle />
          </View>
          <Shortcut title="Cambiar correo" detail="Con un código al correo nuevo" onPress={onOpenChangeEmail} />
          <Shortcut title="Cambiar contraseña" detail="Protege tu cuenta" onPress={onOpenChangePassword} />
          <Shortcut title="Cerrar sesión" detail="Vuelve a la pantalla de inicio" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
