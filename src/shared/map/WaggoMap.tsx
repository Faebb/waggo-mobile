import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Banner } from '@/shared/ui/Banner';
import {
  radius,
  shadows,
  sizes,
  spacing,
  typography,
  useColors,
  useThemedStyles,
  useThemeMode,
} from '@/shared/ui/theme';

import { buildMapHtml } from './buildMapHtml';
import { sameView } from './geo';
import { MapFrame } from './MapFrame';
import { tileUrl } from './mapConfig';
import type { MapFrameHandle } from './mapFrameTypes';
import { mapPaletteOf } from './mapPalette';
import { encodeCommand, parseMapEvent } from './protocol';
import type { Geofence, LatLng, MapMarker, MapRoute } from './types';

/** If the page does not say "ready" by then (no network, CDN blocked), the failure state shows up. */
const READY_TIMEOUT_MS = 20000;

type Status = 'loading' | 'ready' | 'failed';
type ViewState = { center: LatLng; zoom: number };

type Props = {
  center: LatLng;
  zoom: number;
  markers?: MapMarker[];
  route?: MapRoute | null;
  geofence?: Geofence | null;
  /** Points to frame (whole route of a walk): used on load and by "Centrar el mapa" instead of `center`. */
  fitTo?: LatLng[];
  /** False for small decorative maps: no gestures, no buttons, hidden from screen readers. */
  interactive?: boolean;
  /** Keeps following `center` (live walker) until the user pans; "Centrar el mapa" follows again. */
  follow?: boolean;
  /** Fixed pin in the middle: the user moves the map under it to pick a point (design 04 · 4). */
  centerPin?: boolean;
  /** Only for moves made by the user (drag or zoom). */
  onCenterChange?: (center: LatLng, zoom: number) => void;
  onMoveStart?: () => void;
  onMarkerPress?: (id: string) => void;
  /** Summary of what the map shows, read by screen readers (design 07 · 16). */
  accessibilityLabel: string;
  height: number;
  /** Second line of the failure state; the screen says what still works without the map. */
  failureMessage?: string;
};

/**
 * The app's map (PO decision: OpenStreetMap). Leaflet runs in a WebView on iOS/Android (works in Expo Go) and in an
 * iframe on web, with the same page (`buildMapHtml`) and typed messages (`protocol.ts`). Markers, route, zone and
 * theme are declarative props; this component turns their changes into commands once the page is ready.
 * The OSM attribution is drawn by the page, bottom-left, and is never covered (the recenter button is right).
 */
export function WaggoMap({
  center,
  zoom,
  markers = [],
  route = null,
  geofence = null,
  fitTo,
  interactive = true,
  follow = false,
  centerPin = false,
  onCenterChange,
  onMoveStart,
  onMarkerPress,
  accessibilityLabel,
  height,
  failureMessage = 'Revisa tu conexión. El resto de la pantalla sigue funcionando.',
}: Props) {
  const colors = useColors();
  const mode = useThemeMode();
  const styles = useThemedStyles((colors) => ({
    container: { gap: spacing.sm },
    map: { height, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface2 },
    overlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    failed: { flex: 1, justifyContent: 'center', padding: spacing.md, backgroundColor: colors.surface2 },
    fab: {
      position: 'absolute',
      right: spacing.sm,
      bottom: spacing.lg,
      width: sizes.fab,
      height: sizes.fab,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    frame: { flex: 1 },
    listToggle: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      minHeight: sizes.touch,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    listToggleText: { ...typography.caption, fontWeight: '700', color: colors.primary },
    list: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
    listItem: { ...typography.body, color: colors.text },
  }));
  const palette = useMemo(() => mapPaletteOf(colors, mode), [colors, mode]);
  const frame = useRef<MapFrameHandle>(null);
  const lastView = useRef<ViewState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>('loading');
  const [html, setHtml] = useState(() => buildMapHtml({ center, zoom, tileUrl, interactive, palette }));
  const [following, setFollowing] = useState(true);
  // Read by the view effect without re-running it: a pan must not snap the map back.
  const followingRef = useRef(true);
  const [moving, setMoving] = useState(false);
  const [showList, setShowList] = useState(false);
  const ready = status === 'ready';

  const post = useCallback((message: string) => frame.current?.post(message), []);

  // Every prop becomes one encoded command; comparing strings sends only what changed.
  const themeMessage = encodeCommand({ type: 'setTheme', palette });
  const markersMessage = encodeCommand({ type: 'setMarkers', markers });
  const routeMessage = encodeCommand({ type: 'setRoute', route });
  const geofenceMessage = encodeCommand({ type: 'setGeofence', geofence });
  const fitPoints = fitTo !== undefined && fitTo.length > 0 ? fitTo : null;
  const fitMessage = fitPoints ? encodeCommand({ type: 'fitBounds', points: fitPoints }) : null;
  const viewMessage = encodeCommand({ type: 'setView', center, zoom });

  useEffect(() => {
    if (ready) post(themeMessage);
  }, [ready, post, themeMessage]);
  useEffect(() => {
    if (ready) post(geofenceMessage);
  }, [ready, post, geofenceMessage]);
  useEffect(() => {
    if (ready) post(routeMessage);
  }, [ready, post, routeMessage]);
  useEffect(() => {
    if (ready) post(markersMessage);
  }, [ready, post, markersMessage]);

  // Framing the whole route happens once per load; afterwards only "Centrar el mapa" does it again.
  const framed = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (fitMessage !== null) {
      if (!framed.current) {
        framed.current = true;
        post(fitMessage);
      }
      return;
    }
    const next = JSON.parse(viewMessage) as ViewState;
    if ((follow && !followingRef.current) || sameView(lastView.current, next)) return;
    lastView.current = next;
    post(viewMessage);
  }, [ready, post, fitMessage, viewMessage, follow]);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setStatus('failed'), READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  const onMessage = useCallback(
    (raw: string) => {
      const event = parseMapEvent(raw);
      if (event === null) return;
      switch (event.type) {
        case 'ready':
          setStatus('ready');
          break;
        case 'tileError':
        case 'error':
          setStatus('failed');
          break;
        case 'moveStart':
          setMoving(true);
          onMoveStart?.();
          break;
        case 'moveEnd':
          setMoving(false);
          lastView.current = { center: event.center, zoom: event.zoom };
          if (event.byUser) {
            followingRef.current = false;
            setFollowing(false);
            onCenterChange?.(event.center, event.zoom);
          }
          break;
        case 'markerTap':
          onMarkerPress?.(event.id);
          break;
      }
    },
    [onCenterChange, onMarkerPress, onMoveStart],
  );

  function retry() {
    framed.current = false;
    lastView.current = null;
    setHtml(buildMapHtml({ center, zoom, tileUrl, interactive, palette }));
    setStatus('loading');
    setAttempt((current) => current + 1);
  }

  function recenter() {
    followingRef.current = true;
    setFollowing(true);
    lastView.current = null;
    post(fitMessage ?? viewMessage);
  }

  const showControls = interactive && status !== 'failed';

  return (
    <View
      style={styles.container}
      accessibilityElementsHidden={!interactive}
      importantForAccessibility={interactive ? 'auto' : 'no-hide-descendants'}
    >
      <View style={styles.map}>
        {status === 'failed' ? (
          <View style={styles.failed}>
            <Banner
              tone="warning"
              title="No pudimos cargar el mapa."
              message={failureMessage}
              actionLabel="Reintentar"
              onAction={retry}
            />
          </View>
        ) : (
          <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={styles.frame}>
            <MapFrame
              key={attempt}
              html={html}
              title={accessibilityLabel}
              onMessage={onMessage}
              onLoadError={() => setStatus('failed')}
              handleRef={frame}
            />
          </View>
        )}

        {centerPin && status !== 'failed' && <CenterPin lifted={moving} />}
        {status === 'loading' && (
          <View pointerEvents="none" style={styles.overlay}>
            <ActivityIndicator accessibilityLabel="Cargando el mapa" color={colors.primary} />
          </View>
        )}
        {showControls && markers.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showList ? 'Ocultar lista' : 'Ver como lista'}
            onPress={() => setShowList((current) => !current)}
            style={styles.listToggle}
          >
            <Text style={styles.listToggleText}>{showList ? 'Ocultar lista' : 'Ver como lista'}</Text>
          </Pressable>
        )}
        {showControls && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Centrar el mapa"
            onPress={recenter}
            style={styles.fab}
          >
            <RecenterIcon color={following ? colors.primary : colors.muted} filled={following} />
          </Pressable>
        )}
      </View>

      {showList && (
        <View style={styles.list}>
          {markers.map((marker) => (
            <Text key={marker.id} style={styles.listItem}>
              {marker.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

/** The pickup pin fixed in the middle of the map; it lifts while the map moves ("Suelta para elegir este punto"). */
function CenterPin({ lifted }: { lifted: boolean }) {
  const colors = useColors();
  const styles = useThemedStyles(() => ({
    wrap: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));
  // The tip of the drop sits on the center of the map: the drawing is moved up by its own height.
  return (
    <View pointerEvents="none" style={styles.wrap} testID="waggo-map-center-pin">
      <View style={{ transform: [{ translateY: lifted ? -30 : -22 }] }}>
        <Svg width={36} height={44} viewBox="0 0 36 44">
          <Path
            d="M18 43C18 43 3 27.5 3 17a15 15 0 0 1 30 0c0 10.5-15 26-15 26Z"
            fill={colors.primary}
            stroke={colors.surface}
            strokeWidth={2}
          />
          <Circle cx={18} cy={17} r={6} fill={colors.surface} />
        </Svg>
      </View>
    </View>
  );
}

function RecenterIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={7} fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={3} fill={filled ? color : 'none'} stroke={color} strokeWidth={2} />
      <Path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
