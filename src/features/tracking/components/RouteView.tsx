import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors, radius, spacing, typography } from '@/shared/ui/theme';

import { formatKm, formatMinutes } from '../model/formatMetrics';
import { projectRoute } from '../model/routeGeometry';
import type { Route } from '../model/types';

const BOX = { width: 320, height: 200, padding: 20 };

type Props = { route: Route };

/**
 * The walk's route drawn in yellow over the dark surface, with where it started (grey) and where the dogs are now
 * (yellow), plus the distance and time (RF-008, RF-011).
 */
export function RouteView({ route }: Props) {
  const points = projectRoute(route.points, BOX);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <View style={styles.container}>
      <View accessible accessibilityLabel="Ruta del paseo" style={styles.canvas}>
        {points.length === 0 ? (
          <Text style={styles.waiting}>Esperando la primera ubicación…</Text>
        ) : (
          <Svg width="100%" height="100%" viewBox={`0 0 ${BOX.width} ${BOX.height}`}>
            <Polyline
              points={points.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={colors.primary}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {first && <Circle cx={first.x} cy={first.y} r={6} fill={colors.muted} />}
            {last && (
              <Circle cx={last.x} cy={last.y} r={9} fill={colors.primary} stroke={colors.background} strokeWidth={3} />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.metrics}>
        <Metric label="Distancia" value={formatKm(route.distanceKm)} />
        <Metric label="Tiempo" value={formatMinutes(route.elapsedMinutes)} />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  canvas: {
    aspectRatio: BOX.width / BOX.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  waiting: { ...typography.body, color: colors.muted },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: { flex: 1, gap: 2 },
  metricLabel: { ...typography.eyebrow, color: colors.muted },
  metricValue: { ...typography.title, color: colors.text },
});
