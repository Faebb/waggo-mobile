import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useMyProfile } from '../hooks/useProfile';

type Props = { onEdit: () => void };

/** Perfil de usuario: read-only view, like "Personal Profiles" of the reference the user shared. */
export function PersonalInfoScreen({ onEdit }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { alignItems: 'center', gap: spacing.sm },
    name: { ...typography.title, color: colors.text },
    email: { ...typography.body, color: colors.muted },
    rows: { gap: spacing.sm },
    error: { ...typography.body, color: colors.danger },
  }));
  const profile = useMyProfile();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <Text accessibilityRole="header" style={typography.eyebrow}>
          INFORMACIÓN PERSONAL
        </Text>

        {profile.isPending && (
          <>
            <View style={styles.header}>
              <Skeleton width={80} height={80} radius={radius.pill} />
              <Skeleton width={160} height={24} />
              <Skeleton width={200} height={16} />
            </View>
            <View style={styles.rows}>
              <Skeleton width="100%" height={56} />
              <Skeleton width="100%" height={56} />
              <Skeleton width="100%" height={56} />
            </View>
          </>
        )}
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
        {profile.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar tu perfil. Intenta de nuevo.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
