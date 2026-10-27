import { render, screen, userEvent } from '@testing-library/react-native';

import { clearMapCommands, emitMapEvent, sentMapCommands } from '@/test/mapBridge';

import { WaggoMap } from './WaggoMap';
import type { MapMarker } from './types';

const pickup = { latitude: 4.6361, longitude: -74.0645 };
const markers: MapMarker[] = [{ id: 'pickup', kind: 'pickup', position: pickup, label: 'Recogida: Cra 7 # 45-10' }];

describe('WaggoMap', () => {
  beforeEach(clearMapCommands);

  it('loads the OSM map page in a WebView and describes the map for screen readers', async () => {
    await render(
      <WaggoMap center={pickup} zoom={15} markers={markers} accessibilityLabel="Mapa de la recogida" height={200} />,
    );

    const frame = screen.getByTestId('waggo-map-webview');
    const source = frame.props.source as { html: string; baseUrl: string };
    expect(source.baseUrl).toBe('https://waggo.app');
    expect(source.html).toContain('tile.openstreetmap.org');
    expect(source.html).toContain('OpenStreetMap' + String.fromCharCode(92) + 'u003c/a> contributors');
    expect(screen.getByLabelText('Mapa de la recogida')).toBeOnTheScreen();
    expect(screen.getByLabelText('Cargando el mapa')).toBeOnTheScreen();
  });

  it('sends theme, markers, route and zone once the page is ready', async () => {
    await render(
      <WaggoMap
        center={pickup}
        zoom={15}
        markers={markers}
        route={{ walked: [pickup, { latitude: 4.64, longitude: -74.06 }], pending: [] }}
        geofence={{ center: pickup, radiusMeters: 1500, alert: false }}
        accessibilityLabel="Mapa"
        height={200}
      />,
    );

    await emitMapEvent({ type: 'ready' });

    const types = sentMapCommands().map((command) => command.type);
    expect(types).toEqual(expect.arrayContaining(['setTheme', 'setMarkers', 'setRoute', 'setGeofence', 'setView']));
    expect(screen.queryByLabelText('Cargando el mapa')).not.toBeOnTheScreen();
  });

  it('reports where the user left the map and does not move it back', async () => {
    const onCenterChange = jest.fn();
    await render(
      <WaggoMap center={pickup} zoom={15} onCenterChange={onCenterChange} accessibilityLabel="Mapa" height={200} />,
    );
    await emitMapEvent({ type: 'ready' });

    const moved = { latitude: 4.64, longitude: -74.07 };
    await emitMapEvent({ type: 'moveEnd', center: moved, zoom: 16, byUser: true });
    await emitMapEvent({ type: 'moveEnd', center: pickup, zoom: 15, byUser: false });

    expect(onCenterChange).toHaveBeenCalledTimes(1);
    expect(onCenterChange).toHaveBeenCalledWith(moved, 16);
  });

  it('tells which marker was tapped', async () => {
    const onMarkerPress = jest.fn();
    await render(
      <WaggoMap
        center={pickup}
        zoom={15}
        markers={markers}
        onMarkerPress={onMarkerPress}
        accessibilityLabel="Mapa"
        height={200}
      />,
    );

    await emitMapEvent({ type: 'markerTap', id: 'pickup' });

    expect(onMarkerPress).toHaveBeenCalledWith('pickup');
  });

  it('recenters on the content when the user asks', async () => {
    const user = userEvent.setup();
    const end = { latitude: 4.645, longitude: -74.0645 };
    await render(<WaggoMap center={pickup} zoom={15} fitTo={[pickup, end]} accessibilityLabel="Mapa" height={200} />);
    await emitMapEvent({ type: 'ready' });
    clearMapCommands();

    await user.press(screen.getByRole('button', { name: 'Centrar el mapa' }));

    expect(sentMapCommands()).toEqual([{ type: 'fitBounds', points: [pickup, end] }]);
  });

  it('explains in Spanish when the tiles do not load, and retries', async () => {
    const user = userEvent.setup();
    await render(<WaggoMap center={pickup} zoom={15} accessibilityLabel="Mapa" height={200} />);

    await emitMapEvent({ type: 'tileError' });

    expect(screen.getByText('No pudimos cargar el mapa.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(screen.queryByText('No pudimos cargar el mapa.')).not.toBeOnTheScreen();
    expect(screen.getByTestId('waggo-map-webview')).toBeOnTheScreen();
  });

  it('ignores messages that are not map events', async () => {
    const onMarkerPress = jest.fn();
    await render(
      <WaggoMap center={pickup} zoom={15} onMarkerPress={onMarkerPress} accessibilityLabel="Mapa" height={200} />,
    );

    screen.getByTestId('waggo-map-webview').props.onMessage({ nativeEvent: { data: '{"type":"markerTap"}' } });

    expect(onMarkerPress).not.toHaveBeenCalled();
  });

  it('offers the markers as a list, as an alternative to the map', async () => {
    const user = userEvent.setup();
    await render(<WaggoMap center={pickup} zoom={15} markers={markers} accessibilityLabel="Mapa" height={200} />);

    await user.press(screen.getByRole('button', { name: 'Ver como lista' }));

    expect(screen.getByText('Recogida: Cra 7 # 45-10')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ocultar lista' })).toBeOnTheScreen();
  });

  it('is decorative without controls when not interactive (home mini map)', async () => {
    await render(
      <WaggoMap
        center={pickup}
        zoom={15}
        markers={markers}
        interactive={false}
        accessibilityLabel="Mapa"
        height={120}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Centrar el mapa' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ver como lista' })).not.toBeOnTheScreen();
    expect(
      (screen.getByTestId('waggo-map-webview', { includeHiddenElements: true }).props.source as { html: string }).html,
    ).toContain('"interactive":false');
  });

  it('shows a fixed pin in the center to pick a point', async () => {
    await render(<WaggoMap center={pickup} zoom={15} centerPin accessibilityLabel="Mapa" height={200} />);

    expect(screen.getByTestId('waggo-map-center-pin')).toBeOnTheScreen();
  });
});
