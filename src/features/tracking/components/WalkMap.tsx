import { Text, View } from 'react-native';

import type { DevicePosition } from '@/shared/location/devicePosition';
import { WaggoMap } from '@/shared/map/WaggoMap';
import type { LatLng } from '@/shared/map/types';
import { Banner } from '@/shared/ui/Banner';
import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { useRoute } from '../hooks/useRoute';
import { useWalkAlerts } from '../hooks/useWalkAlerts';
import type { AlertParty } from '../model/alerts';
import { formatKm, formatMinutes } from '../model/formatMetrics';
import type { Route } from '../model/types';
import { walkMapScene, type SceneInput, type WalkPhase } from '../model/walkMapScene';

type Props = {
  walkId: string;
  status: WalkPhase;
  viewer: AlertParty;
  pickup: LatLng;
  pickupAddress: string;
  petNames?: string;
  /** The walker's own position before starting, when shared. */
  walkerPosition?: DevicePosition | null;
  height?: number;
};

const MAP_HEIGHT = 280;

/**
 * The walk on the OpenStreetMap map (RF-008, design 04 and 07 · 14–18, 29–30): pickup while waiting, live route
 * with the dog and the agreed zone during the walk (refreshes by itself), the whole route at the end, plus distance
 * and time. Replaces the SVG route drawing.
 */
export function WalkMap(props: Props) {
  if (props.status === 'InProgress') return <LiveWalkMap {...props} />;
  if (props.status === 'Completed') return <FinishedWalkMap {...props} />;
  return <SceneView input={sceneInputOf(props)} height={props.height} />;
}

function sceneInputOf(props: Props, extra: Partial<SceneInput> = {}): SceneInput {
  return {
    status: props.status,
    viewer: props.viewer,
    pickup: props.pickup,
    pickupAddress: props.pickupAddress,
    petNames: props.petNames,
    walkerPosition: props.walkerPosition,
    now: Date.now(),
    ...extra,
  };
}

function LiveWalkMap(props: Props) {
  const route = useRoute(props.walkId, true);
  const alerts = useWalkAlerts(props.walkId);
  return (
    <SceneView
      input={sceneInputOf(props, { route: route.data ?? null, alerts: alerts.data ?? [] })}
      route={route.data}
      routeState={routeStateOf(route)}
      onRetryRoute={() => void route.refetch()}
      height={props.height}
      viewer={props.viewer}
    />
  );
}

function FinishedWalkMap(props: Props) {
  const route = useRoute(props.walkId, false);
  return (
    <SceneView
      input={sceneInputOf(props, { route: route.data ?? null })}
      route={route.data}
      routeState={routeStateOf(route)}
      onRetryRoute={() => void route.refetch()}
      height={props.height}
    />
  );
}

/** Loading and error only matter before the first answer: a failed refresh keeps the last route on screen. */
type RouteState = 'loading' | 'error' | 'ready';

function routeStateOf(route: { data?: Route; isError: boolean }): RouteState {
  if (route.data !== undefined) return 'ready';
  return route.isError ? 'error' : 'loading';
}

function SceneView({
  input,
  route,
  routeState = 'ready',
  onRetryRoute,
  height = MAP_HEIGHT,
  viewer,
}: {
  input: SceneInput;
  route?: Route;
  routeState?: RouteState;
  onRetryRoute?: () => void;
  height?: number;
  viewer?: AlertParty;
}) {
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.md },
    waiting: { ...typography.body, color: colors.muted },
    metrics: { flexDirection: 'row', gap: spacing.md },
  }));
  const scene = walkMapScene(input);

  return (
    <View style={styles.container}>
      <WaggoMap
        center={scene.center}
        zoom={scene.zoom}
        markers={scene.markers}
        route={scene.route}
        geofence={scene.geofence}
        fitTo={scene.fitTo}
        follow={scene.follow}
        accessibilityLabel={scene.label}
        height={height}
        failureMessage="El paseo sigue y te mostramos los datos aquí abajo."
      />
      {scene.staleMinutes !== null && (
        <Banner
          tone="info"
          message={
            viewer === 'Walker'
              ? `Sin señal desde hace ${scene.staleMinutes} min. Guardamos tus posiciones y las enviaremos al reconectar.`
              : `Última posición hace ${scene.staleMinutes} min. El teléfono del paseador guarda la ruta y la enviará al reconectarse.`
          }
        />
      )}
      {routeState === 'loading' && <Text style={styles.waiting}>Cargando el recorrido…</Text>}
      {routeState === 'error' && (
        <Banner
          tone="warning"
          message="No pudimos cargar el recorrido."
          actionLabel="Reintentar"
          onAction={onRetryRoute}
        />
      )}
      {route !== undefined && route.points.length === 0 && (
        <Text style={styles.waiting}>Esperando la primera ubicación…</Text>
      )}
      {route !== undefined && (
        <View style={styles.metrics}>
          <Metric label="Distancia" value={formatKm(route.distanceKm)} />
          <Metric label="Tiempo" value={formatMinutes(route.elapsedMinutes)} />
        </View>
      )}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles((colors) => ({
    metric: { flex: 1, gap: spacing.xs },
    metricLabel: { ...typography.eyebrow, color: colors.muted },
    metricValue: { ...typography.title, color: colors.text },
  }));

  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
