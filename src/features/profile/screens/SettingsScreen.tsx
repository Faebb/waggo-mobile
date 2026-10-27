import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '@/features/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Shortcut } from '@/shared/ui/Shortcut';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile } from '../hooks/useProfile';

type Props = {
  onOpenPersonalInfo: () => void;
  onOpenNotifications: () => void;
  onOpenChangePassword: () => void;
  onOpenChangeEmail: () => void;
  onLoggedOut: () => void;
};

/**
 * Configuración for both roles (design proposal 07 · 23 and 34): profile card, "Tu cuenta", "Preferencias" (theme
 * as a radio group, notices) and "Cerrar sesión". Dogs and walks live in the tab bar (ADR-019). "Cambiar correo" and "Cambiar contraseña" (RF-005)
 * stand in for "Cuenta y seguridad"; "Centro de ayuda" and "Términos y privacidad" wait for their specs.
 */
export function SettingsScreen({
  onOpenPersonalInfo,
  onOpenNotifications,
  onOpenChangePassword,
  onOpenChangeEmail,
  onLoggedOut,
}: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardText: { flex: 1, gap: spacing.xs },
    name: { ...typography.subtitle, color: colors.text },
    email: { ...typography.body, color: colors.muted },
    section: { gap: 0 },
    eyebrow: { ...typography.eyebrow, color: colors.muted, marginBottom: spacing.xs },
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
        <Text accessibilityRole="header" style={styles.title}>
          Configuración
        </Text>

        {profile.isPending && (
          <View style={styles.card}>
            <Skeleton width={64} height={64} radius={radius.pill} />
            <View style={styles.cardText}>
              <Skeleton width={140} height={20} />
              <Skeleton width={180} height={16} />
            </View>
          </View>
        )}
        {profile.data && (
          <View style={styles.card}>
            <Avatar label={profile.data.fullName ?? profile.data.email} />
            <View style={styles.cardText}>
              <Text style={styles.name}>{profile.data.fullName ?? 'Agrega tu nombre'}</Text>
              <Text style={styles.email}>{profile.data.email}</Text>
            </View>
          </View>
        )}
        {profile.isError && (
          <ErrorState message="No pudimos cargar tu perfil. Intenta de nuevo." onRetry={() => void profile.refetch()} />
        )}

        <View style={styles.section}>
          <Text style={styles.eyebrow}>TU CUENTA</Text>
          <Shortcut title="Información personal" detail="Nombre y celular" onPress={onOpenPersonalInfo} />
          <Shortcut title="Cambiar correo" detail="Con un código al correo nuevo" onPress={onOpenChangeEmail} />
          <Shortcut title="Cambiar contraseña" detail="Protege tu cuenta" onPress={onOpenChangePassword} />
        </View>

        <View style={styles.section}>
          <Text style={styles.eyebrow}>PREFERENCIAS</Text>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Tema</Text>
            <ThemeToggle />
          </View>
          <Shortcut title="Notificaciones" detail="Avisos del recorrido" onPress={onOpenNotifications} />
        </View>

        <Button label="Cerrar sesión" variant="secondary" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}
