import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { layout, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile } from '../hooks/useProfile';

type Props = { onEdit: () => void };

/** Perfil de usuario: read-only view, like "Personal Profiles" of the reference the user shared. */
export function PersonalInfoScreen({ onEdit }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { alignItems: 'center', gap: spacing.sm },
    name: { ...typography.title, color: colors.text },
    email: { ...typography.body, color: colors.muted },
  }));
  const profile = useMyProfile();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <Text accessibilityRole="header" style={typography.eyebrow}>
          INFORMACIÓN PERSONAL
        </Text>

        {profile.isPending && <ActivityIndicator accessibilityLabel="Cargando tu perfil" color={colors.primary} />}
        {profile.data && (
          <>
            <View style={styles.header}>
              <Avatar label={profile.data.fullName ?? profile.data.email} size={80} />
              <Text style={styles.name}>{profile.data.fullName ?? 'Sin nombre'}</Text>
              <Text style={styles.email}>{profile.data.email}</Text>
            </View>

            <View>
              <DetailRow label="Nombre completo" value={profile.data.fullName ?? 'Sin nombre'} />
              <DetailRow label="Correo" value={profile.data.email} />
              <DetailRow label="Celular" value={profile.data.phone ?? 'Sin celular'} />
            </View>

            <Button label="Editar" variant="secondary" onPress={onEdit} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
