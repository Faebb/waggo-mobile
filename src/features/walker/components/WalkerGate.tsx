import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { DetailRow } from '@/shared/ui/DetailRow';
import { layout, radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { useMyWalkerProfile } from '../hooks/useWalkerProfile';
import type { WalkerProfile } from '../model/types';
import { BecomeWalkerScreen } from '../screens/BecomeWalkerScreen';

type Props = { children: ReactNode };

/**
 * RF-002/RF-003: only verified walkers reach the requests. A new walker registers, a pending one waits, a rejected
 * one sees why. The API enforces the same rule; this only avoids showing a screen that would fail.
 */
export function WalkerGate({ children }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    reason: { ...typography.subtitle, color: colors.danger },
    lead: { ...typography.body, color: colors.muted },
  }));
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
        <Banner
          tone="danger"
          message="No pudimos cargar tu perfil de paseador."
          actionLabel="Intentar de nuevo"
          onAction={() => void profile.refetch()}
        />
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
      <VerificationSteps />
      <ProfileDetails profile={mine} />
      <Button
        label="Revisar de nuevo"
        loadingLabel="Revisando…"
        loading={profile.isFetching}
        variant="secondary"
        onPress={() => void profile.refetch()}
      />
    </Frame>
  );
}

function Frame({ title, children }: { title?: string; children: ReactNode }) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    header: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
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

const STEPS = [
  { label: 'Datos enviados', state: 'hecho' },
  { label: 'Revisamos tu documento', state: 'en curso' },
  { label: 'Listo para pasear', state: 'pendiente' },
] as const;

/** Three-step timeline of the verification (design proposal 07 · 27); each step says its state, not only a color. */
function VerificationSteps() {
  const styles = useThemedStyles((colors) => ({
    list: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    dot: { width: 14, height: 14, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.borderStrong },
    hecho: { backgroundColor: colors.success, borderColor: colors.success },
    'en curso': { borderColor: colors.primary, backgroundColor: colors.surface2 },
    pendiente: {},
    label: { ...typography.body, color: colors.text },
    state: { ...typography.caption, color: colors.muted },
  }));

  return (
    <View style={styles.list}>
      {STEPS.map((step) => (
        <View key={step.label} accessible accessibilityLabel={`${step.label}: ${step.state}`} style={styles.row}>
          <View style={[styles.dot, styles[step.state]]} />
          <Text style={styles.label}>{step.label}</Text>
          <Text style={styles.state}>{step.state}</Text>
        </View>
      ))}
    </View>
  );
}
