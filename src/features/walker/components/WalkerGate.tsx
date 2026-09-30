import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/shared/ui/BrandMark';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { colors, layout, spacing, typography } from '@/shared/ui/theme';

import { useMyWalkerProfile } from '../hooks/useWalkerProfile';
import type { WalkerProfile } from '../model/types';
import { BecomeWalkerScreen } from '../screens/BecomeWalkerScreen';

type Props = { children: ReactNode };

/**
 * RF-002/RF-003: only verified walkers reach the requests. A new walker registers, a pending one waits, a rejected
 * one sees why. The API enforces the same rule; this only avoids showing a screen that would fail.
 */
export function WalkerGate({ children }: Props) {
  const profile = useMyWalkerProfile();

  if (profile.isPending) {
    return (
      <Frame>
        <ActivityIndicator accessibilityLabel="Cargando tu perfil" color={colors.primary} />
      </Frame>
    );
  }

  if (profile.isError && profile.data === undefined) {
    return (
      <Frame>
        <Text accessibilityRole="alert" style={styles.error}>
          No pudimos cargar tu perfil de paseador.
        </Text>
        <Button label="Intentar de nuevo" variant="secondary" onPress={() => profile.refetch()} />
      </Frame>
    );
  }

  const mine = profile.data ?? null;
  if (mine === null) {
    return <BecomeWalkerScreen />;
  }

  if (mine.status === 'Approved') {
    return <>{children}</>;
  }

  if (mine.status === 'Rejected') {
    return (
      <Frame title="No pudimos verificar tu perfil">
        <Text style={styles.reason}>{mine.rejectionReason}</Text>
        <Text style={styles.lead}>Si crees que es un error, escríbenos por soporte y lo revisamos contigo.</Text>
        <ProfileDetails profile={mine} />
      </Frame>
    );
  }

  return (
    <Frame title="Estamos verificando tu perfil">
      <Text style={styles.lead}>
        Revisamos tu documento y tus datos antes de tu primer paseo. Te avisaremos apenas puedas recibir solicitudes.
      </Text>
      <ProfileDetails profile={mine} />
      <Button
        label={profile.isFetching ? 'Revisando…' : 'Revisar de nuevo'}
        variant="secondary"
        onPress={() => profile.refetch()}
        disabled={profile.isFetching}
      />
    </Frame>
  );
}

function Frame({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <BrandMark />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MODO PASEADOR</Text>
          {title !== undefined && (
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          )}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileDetails({ profile }: { profile: WalkerProfile }) {
  return (
    <View>
      <DetailRow label="Nombre" value={profile.fullName} />
      <DetailRow label="Documento" value={`${profile.documentType} ···· ${profile.documentLast4}`} />
      <DetailRow label="Celular" value={profile.phone} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  column: layout.column,
  content: { gap: spacing.lg, padding: spacing.lg },
  header: { gap: spacing.xs },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  title: { ...typography.display, color: colors.text },
  lead: { ...typography.body, color: colors.muted },
  reason: { ...typography.subtitle, color: colors.danger },
  error: { ...typography.body, color: colors.danger },
});
