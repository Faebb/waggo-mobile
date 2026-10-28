import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/shared/ui/EmptyState';
import { AlertIcon } from '@/shared/ui/icons/AlertIcon';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { StatusPill } from '@/shared/ui/StatusPill';
import { radius, shadows, sizes, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { formatTimeAgo } from '../model/format';
import type { ActiveWalkSummary, AdminOperations, OperationAlert } from '../model/operations';

/** A walk in progress with no point for this long shows "Sin señal" (design proposal 07 · 36; PO: 30 s). */
const SIGNAL_LOST_AFTER_MS = 30_000;

type OperationView = 'alerts' | 'walks';

type Props = {
  operations: AdminOperations;
  onOpenWalk: (walkId: string) => void;
  /** Injected by tests; the screen uses the device clock. */
  now?: Date;
};

/** RF-009 geofence and RF-010 anomaly (stopped too long). */
function automaticTitle(kind: OperationAlert['kind']): string {
  return kind === 'Geofence' ? 'Salió de la zona' : 'Detenido';
}

/**
 * Admin "Operación" (spec RF-002/RF-003 panel, slices 2–3; design proposal 07 · 36): active emergencies first, then
 * the automatic alerts, and a second tab with every walk in progress and its last signal. The city map of the
 * design waits for the map provider; this list is its accessible alternative and works on its own.
 */
export function OperationPanel({ operations, onOpenWalk, now = new Date() }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.md },
    section: { gap: spacing.sm },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    emergency: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    emergencyTitle: { ...typography.body, fontWeight: '700', color: colors.danger, flex: 1 },
    detail: { ...typography.caption, color: colors.muted },
    openWalk: {
      minHeight: sizes.touch,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.danger,
    },
    openWalkText: { ...typography.caption, fontWeight: '700', color: colors.dangerText },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: sizes.touch,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    rowTitle: { ...typography.body, fontWeight: '700', color: colors.text },
  }));
  const [view, setView] = useState<OperationView>('alerts');

  if (!operations.available) {
    return (
      <EmptyState
        title="Próximamente"
        message="Aquí verás las emergencias activas, las alertas automáticas y los paseos en curso de toda la ciudad."
      />
    );
  }

  const emergencies = operations.alerts.filter((alert) => alert.kind === 'Emergency');
  const automatic = operations.alerts.filter((alert) => alert.kind !== 'Emergency');

  function walkDetail(walk: ActiveWalkSummary): string {
    if (walk.status === 'Accepted') return `${walk.area} · aceptado, por iniciar`;
    const signal = walk.lastSignalAt === null ? 'sin señal todavía' : `señal ${formatTimeAgo(walk.lastSignalAt, now)}`;
    return `${walk.area} · ${walk.elapsedMinutes} de ${walk.durationMinutes} min · ${signal}`;
  }

  function signalLost(walk: ActiveWalkSummary): boolean {
    if (walk.status !== 'InProgress') return false;
    return walk.lastSignalAt === null || now.getTime() - new Date(walk.lastSignalAt).getTime() > SIGNAL_LOST_AFTER_MS;
  }

  return (
    <View style={styles.container}>
      <SegmentedControl
        label="Vista de operación"
        options={[
          { value: 'alerts', label: 'Alertas' },
          { value: 'walks', label: `En curso · ${operations.activeWalks.length}` },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'alerts' && operations.alerts.length === 0 && <EmptyState title="No hay alertas activas." />}

      {view === 'alerts' && emergencies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>EMERGENCIAS ACTIVAS · {emergencies.length}</Text>
          {emergencies.map((alert) => (
            <View key={alert.id} style={styles.emergency}>
              <View style={styles.emergencyHeader}>
                <AlertIcon color={colors.danger} size={20} />
                <Text style={styles.emergencyTitle}>Emergencia · {alert.petName}</Text>
              </View>
              <Text style={styles.detail}>
                {alert.walkerName} / {alert.ownerName} · {formatTimeAgo(alert.raisedAt, now)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver paseo de ${alert.petName}`}
                onPress={() => onOpenWalk(alert.walkId)}
                style={styles.openWalk}
              >
                <Text style={styles.openWalkText}>Ver paseo</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {view === 'alerts' && automatic.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>ALERTAS AUTOMÁTICAS · {automatic.length}</Text>
          {automatic.map((alert) => (
            <Pressable
              key={alert.id}
              accessibilityRole="button"
              onPress={() => onOpenWalk(alert.walkId)}
              style={styles.row}
            >
              <AlertIcon color={colors.warning} size={20} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>
                  {automaticTitle(alert.kind)} · {alert.petName}
                </Text>
                <Text style={styles.detail}>
                  Paseo de {alert.walkerName} · {formatTimeAgo(alert.raisedAt, now)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {view === 'walks' && operations.activeWalks.length === 0 && <EmptyState title="No hay paseos en curso." />}

      {view === 'walks' && operations.activeWalks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>PASEOS EN CURSO · {operations.activeWalks.length}</Text>
          {operations.activeWalks.map((walk) => (
            <Pressable
              key={walk.walkId}
              accessibilityRole="button"
              onPress={() => onOpenWalk(walk.walkId)}
              style={styles.row}
            >
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>
                  {walk.petName} · {walk.walkerName}
                </Text>
                <Text style={styles.detail}>{walkDetail(walk)}</Text>
              </View>
              {walk.status === 'Accepted' && <StatusPill label="Aceptado" tone="info" />}
              {signalLost(walk) && <StatusPill label="Sin señal" tone="danger" />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
