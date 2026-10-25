import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/shared/ui/BrandMark';
import { layout, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { PendingWalkerCard } from '../components/PendingWalkerCard';
import { useApproveWalker, usePendingWalkers, useRejectWalker } from '../hooks/useAdminWalkers';

/** RF-002/RF-003: an admin reviews the walkers waiting for verification, one by one. */
export function AdminWalkersScreen() {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.display, color: colors.text },
    error: { ...typography.body, color: colors.danger },
    empty: { ...typography.body, color: colors.muted },
  }));
  const pending = usePendingWalkers();
  const approve = useApproveWalker();
  const reject = useRejectWalker();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <BrandMark />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MODO ADMIN</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Paseadores por verificar
          </Text>
        </View>

        {pending.isPending && (
          <ActivityIndicator accessibilityLabel="Cargando paseadores pendientes" color={colors.primary} />
        )}
        {pending.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar los paseadores pendientes.
          </Text>
        )}
        {pending.data?.length === 0 && <Text style={styles.empty}>No hay paseadores por verificar.</Text>}
        {pending.data?.map((profile) => (
          <PendingWalkerCard
            key={profile.id}
            profile={profile}
            approving={approve.isPending && approve.variables === profile.id}
            rejecting={reject.isPending && reject.variables?.id === profile.id}
            onApprove={() => approve.mutate(profile.id)}
            onReject={(reason) => reject.mutate({ id: profile.id, reason })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
