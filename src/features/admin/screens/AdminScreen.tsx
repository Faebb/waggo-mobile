import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { WalkerProfile } from '@/features/walker';
import { ApiError } from '@/shared/api/ApiError';
import { Banner } from '@/shared/ui/Banner';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { OperationPanel } from '../components/OperationPanel';
import { PendingWalkerCard } from '../components/PendingWalkerCard';
import { RejectWalkerSheet } from '../components/RejectWalkerSheet';
import { useAdminOperations } from '../hooks/useAdminOperations';
import { useApproveWalker, usePendingWalkers, useRejectWalker } from '../hooks/useAdminWalkers';

type Section = 'walkers' | 'operation';

type Props = { onOpenWalk: (walkId: string) => void };

function messagesOf(error: Error | null, fallback: string): string[] {
  if (error === null) return [];
  return error instanceof ApiError ? error.errors.map((item) => item.message) : [fallback];
}

/**
 * Admin panel (spec RF-002/RF-003 panel; design proposal 07 · 35–36). "Paseadores": the verification queue, one card
 * per pending walker, approve or reject with a reason in a sheet. "Operación": alerts and walks in progress, which
 * waits for a global endpoint in waggo-api (slices 2–3).
 */
export function AdminScreen({ onOpenWalk }: Props) {
  const styles = useThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    column: layout.column,
    content: { gap: spacing.md, padding: spacing.lg },
    header: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
    skeletons: { gap: spacing.md },
  }));
  const [section, setSection] = useState<Section>('walkers');
  const [rejectTarget, setRejectTarget] = useState<WalkerProfile | null>(null);
  const [approvedName, setApprovedName] = useState<string | null>(null);
  const pending = usePendingWalkers();
  const approve = useApproveWalker();
  const reject = useRejectWalker();
  const operations = useAdminOperations();
  const busy = approve.isPending || reject.isPending;
  const actionErrors = [
    ...messagesOf(approve.error, 'No pudimos aprobar al paseador. Intenta de nuevo.'),
    ...messagesOf(reject.error, 'No pudimos rechazar al paseador. Intenta de nuevo.'),
  ];

  function approveWalker(profile: WalkerProfile) {
    setApprovedName(null);
    reject.reset();
    approve.mutate(profile.id, { onSuccess: () => setApprovedName(profile.fullName) });
  }

  function rejectWalker(reason: string) {
    if (rejectTarget === null) return;
    setApprovedName(null);
    approve.reset();
    reject.mutate({ id: rejectTarget.id, reason }, { onSettled: () => setRejectTarget(null) });
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.column, styles.content]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ADMINISTRACIÓN</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {section === 'walkers' ? 'Verificación' : 'Operación'}
          </Text>
        </View>
        <SegmentedControl
          label="Sección del panel"
          options={[
            { value: 'walkers', label: 'Paseadores' },
            { value: 'operation', label: 'Operación' },
          ]}
          value={section}
          onChange={setSection}
        />

        {section === 'operation' && <OperationPanel operations={operations} onOpenWalk={onOpenWalk} />}

        {section === 'walkers' && (
          <>
            {approvedName !== null && <Banner tone="success" message={`Aprobaste a ${approvedName}.`} />}
            {actionErrors.length > 0 && <Banner tone="danger" message={actionErrors.join('\n')} />}

            {pending.isPending && (
              <View accessible accessibilityRole="progressbar" accessibilityLabel="Cargando paseadores pendientes">
                <View style={styles.skeletons}>
                  <Skeleton width="100%" height={200} radius={radius.lg} />
                  <Skeleton width="100%" height={200} radius={radius.lg} />
                </View>
              </View>
            )}
            {pending.isError && (
              <ErrorState
                message="No pudimos cargar los paseadores pendientes."
                onRetry={() => void pending.refetch()}
              />
            )}
            {pending.data?.length === 0 && (
              <EmptyState
                title="No hay paseadores por verificar."
                message="Cuando alguien envíe su perfil, aparecerá aquí."
              />
            )}
            {pending.data !== undefined && pending.data.length > 0 && (
              <Text style={styles.eyebrow}>PENDIENTES · {pending.data.length}</Text>
            )}
            {pending.data?.map((profile) => (
              <PendingWalkerCard
                key={profile.id}
                profile={profile}
                approving={approve.isPending && approve.variables === profile.id}
                busy={busy}
                onApprove={() => approveWalker(profile)}
                onReject={() => setRejectTarget(profile)}
              />
            ))}
          </>
        )}
      </ScrollView>

      <RejectWalkerSheet
        key={rejectTarget?.id ?? 'closed'}
        fullName={rejectTarget?.fullName ?? null}
        rejecting={reject.isPending}
        onConfirm={rejectWalker}
        onCancel={() => setRejectTarget(null)}
      />
    </SafeAreaView>
  );
}
