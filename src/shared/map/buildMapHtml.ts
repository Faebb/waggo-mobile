import { LEAFLET, OSM_ATTRIBUTION } from './mapConfig';
import type { LatLng, MapPalette } from './types';

export type MapHtmlOptions = {
  center: LatLng;
  zoom: number;
  tileUrl: string;
  /** False for small decorative maps (home card): no gestures, no keyboard. */
  interactive: boolean;
  palette: MapPalette;
};

/** JSON safe inside a <script>: "<" and the JS line separators are escaped. */
function scriptJson(value: unknown): string {
  // Backslash + u + hex, built from char codes so the source never holds a raw escape sequence.
  const escape = (code: number) => String.fromCharCode(92) + 'u' + code.toString(16).padStart(4, '0');
  return JSON.stringify(value)
    .replace(/</g, escape(0x3c))
    .split(String.fromCharCode(0x2028))
    .join(escape(0x2028))
    .split(String.fromCharCode(0x2029))
    .join(escape(0x2029));
}

const STYLE = `
html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: var(--land); }
.leaflet-container { background: var(--land); font-family: Inter, system-ui, -apple-system, sans-serif; }
.leaflet-tile-pane { filter: var(--tile-filter); }
.leaflet-control-attribution { font-size: 11px; line-height: 16px; padding: 2px 6px; }
.wg-icon { background: none; border: none; }
.wg-marker { position: absolute; left: 0; top: 0; }
.wg-marker::before { content: ''; position: absolute; width: 44px; height: 44px; left: -22px; top: -22px; }
.wg-marker > * { position: absolute; box-sizing: border-box; box-shadow: 0 2px 8px rgba(22, 33, 46, 0.25); }
.wg-dot { width: 16px; height: 16px; left: -8px; top: -8px; border-radius: 50%; background: var(--primary); border: 2px solid var(--surface); }
.wg-avatar { width: 40px; height: 40px; left: -20px; top: -20px; border-radius: 50%; background: var(--primary); color: var(--primary-text); border: 2px solid var(--surface); display: flex; align-items: center; justify-content: center; font: 700 16px/1 Inter, system-ui, sans-serif; }
.wg-dog .wg-avatar { width: 32px; height: 32px; left: -16px; top: -16px; background: var(--surface); color: var(--text); border-color: var(--primary); }
.is-stale .wg-avatar { background: var(--muted); border-color: var(--surface); color: var(--surface); }
.wg-pulse { width: 40px; height: 40px; left: -20px; top: -20px; border-radius: 50%; background: var(--primary); box-shadow: none !important; z-index: -1; animation: wg-pulse 1.6s ease-out infinite; }
@keyframes wg-pulse { from { transform: scale(1); opacity: 0.35; } to { transform: scale(2.2); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .wg-pulse { animation: none; opacity: 0.2; } }
.wg-drop { width: 36px; height: 36px; left: -18px; top: -44px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: var(--primary); color: var(--primary-text); border: 2px solid var(--surface); display: flex; align-items: center; justify-content: center; }
.wg-drop svg { transform: rotate(45deg); }
.wg-destination .wg-drop { background: var(--secondary); }
.wg-alert { width: 28px; height: 28px; left: -14px; top: -14px; border-radius: 4px; transform: rotate(45deg); background: var(--danger); border: 2px solid var(--surface); display: flex; align-items: center; justify-content: center; }
.wg-alert span { transform: rotate(-45deg); color: var(--danger-text); font: 700 16px/1 Inter, system-ui, sans-serif; }
.wg-pill { left: 0; top: -40px; transform: translateX(-50%); white-space: nowrap; padding: 8px 12px; border-radius: 999px; background: var(--surface); color: var(--text); border: 2px solid var(--primary); font: 700 14px/1.2 Inter, system-ui, sans-serif; }
.is-selected .wg-pill { background: var(--primary); color: var(--primary-text); }
`;

/**
 * The page script. Plain ES5 so old Android WebViews run it. It talks to the app through
 * `window.ReactNativeWebView.postMessage` (iOS/Android) or `window.parent.postMessage` (web iframe), and receives
 * commands through `window.waggoReceive` (WebView `injectJavaScript`) or the `message` event (iframe).
 */
const SCRIPT = `
(function () {
  var config = window.__WAGGO_MAP__;
  function send(message) {
    var data = JSON.stringify(message);
    if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(data); }
    else if (window.parent && window.parent !== window) { window.parent.postMessage(data, '*'); }
  }
  if (!window.L) { send({ type: 'error', message: 'leaflet' }); return; }

  var SVG = {
    house: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20h-5v-5H9v5H4z" fill="currentColor"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 21V4h10l-2 4 2 4H7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };
  var state = { palette: config.palette, markers: [], route: null, geofence: null };
  var interactive = config.interactive;
  var map = L.map('map', {
    zoomControl: false, attributionControl: false, dragging: interactive, touchZoom: interactive,
    scrollWheelZoom: interactive, doubleClickZoom: interactive, boxZoom: interactive, keyboard: interactive
  });
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
  var tiles = L.tileLayer(config.tileUrl, {
    maxZoom: 19, attribution: config.attribution, referrerPolicy: 'strict-origin-when-cross-origin'
  }).addTo(map);
  var fenceLayer = L.layerGroup().addTo(map);
  var routeLayer = L.layerGroup().addTo(map);
  var markerLayer = L.layerGroup().addTo(map);

  var loaded = 0, failed = 0, reported = false;
  tiles.on('tileload', function () { loaded += 1; });
  tiles.on('tileerror', function () {
    failed += 1;
    if (!reported && loaded === 0 && failed >= 3) { reported = true; send({ type: 'tileError' }); }
  });

  function ll(point) { return [point.latitude, point.longitude]; }
  function round(value) { return Math.round(value * 1e6) / 1e6; }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    node.className = className;
    if (text) { node.textContent = text; }
    return node;
  }

  function applyTheme() {
    var p = state.palette, style = document.documentElement.style;
    style.setProperty('--primary', p.primary); style.setProperty('--primary-text', p.primaryText);
    style.setProperty('--secondary', p.secondary); style.setProperty('--danger', p.danger);
    style.setProperty('--danger-text', p.dangerText); style.setProperty('--muted', p.muted);
    style.setProperty('--surface', p.surface); style.setProperty('--text', p.text);
    style.setProperty('--land', p.land); style.setProperty('--tile-filter', p.tileFilter);
  }

  function iconFor(marker) {
    var root = el('div', 'wg-marker wg-' + marker.kind + (marker.selected ? ' is-selected' : '') + (marker.stale ? ' is-stale' : ''));
    var body;
    if (marker.kind === 'pickup' || marker.kind === 'destination') {
      body = el('div', 'wg-drop');
      body.innerHTML = marker.kind === 'pickup' ? SVG.house : SVG.flag;
    } else if (marker.kind === 'alert') {
      body = el('div', 'wg-alert');
      body.appendChild(el('span', '', '!'));
    } else if (marker.kind === 'offer') {
      body = el('div', 'wg-pill', marker.text || '');
    } else if (marker.kind === 'owner') {
      body = el('div', 'wg-dot');
    } else {
      body = el('div', 'wg-avatar', marker.text || '');
    }
    if (marker.kind === 'walker' && !marker.stale) { root.appendChild(el('div', 'wg-pulse')); }
    root.appendChild(body);
    return L.divIcon({ html: root, className: 'wg-icon', iconSize: [0, 0] });
  }

  function drawMarkers() {
    markerLayer.clearLayers();
    state.markers.forEach(function (marker) {
      if (marker.accuracyMeters) {
        L.circle(ll(marker.position), {
          radius: marker.accuracyMeters, stroke: false, fillColor: state.palette.primary, fillOpacity: 0.15, interactive: false
        }).addTo(markerLayer);
      }
      var moving = marker.kind === 'walker' || marker.kind === 'dog';
      var layer = L.marker(ll(marker.position), {
        icon: iconFor(marker), title: marker.label, alt: marker.label, keyboard: interactive, zIndexOffset: moving ? 1000 : 0
      });
      layer.on('click', function () { send({ type: 'markerTap', id: marker.id }); });
      layer.addTo(markerLayer);
    });
  }

  function drawRoute() {
    routeLayer.clearLayers();
    var route = state.route, p = state.palette;
    if (!route) { return; }
    var walked = route.walked.map(ll), pending = route.pending.map(ll);
    if (pending.length > 1) {
      L.polyline(pending, { color: p.primary, weight: 4, opacity: 0.6, dashArray: '2 8', lineCap: 'round', interactive: false }).addTo(routeLayer);
    }
    if (walked.length > 1) {
      L.polyline(walked, { color: p.routeCasing, weight: 10, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(routeLayer);
      L.polyline(walked, { color: p.primary, weight: 6, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(routeLayer);
    }
    if (walked.length > 0) {
      L.circleMarker(walked[0], { radius: 6, color: p.primary, weight: 3, fillColor: p.surface, fillOpacity: 1, interactive: false }).addTo(routeLayer);
    }
  }

  function drawFence() {
    fenceLayer.clearLayers();
    var fence = state.geofence, p = state.palette;
    if (!fence) { return; }
    var color = fence.alert ? p.danger : p.secondary;
    L.circle(ll(fence.center), {
      radius: fence.radiusMeters, color: color, weight: fence.alert ? 3 : 2, dashArray: fence.alert ? null : '6 6',
      fillColor: color, fillOpacity: fence.alert ? 0.1 : 0.08, interactive: false
    }).addTo(fenceLayer);
  }

  var programmatic = false;
  function setView(center, zoom) { programmatic = true; map.setView(ll(center), zoom, { animate: false }); }
  function fitBounds(points) {
    if (points.length === 1) { setView(points[0], 16); return; }
    programmatic = true;
    map.fitBounds(L.latLngBounds(points.map(ll)), { padding: [40, 40], maxZoom: 16, animate: false });
  }

  map.on('movestart', function () { if (!programmatic) { send({ type: 'moveStart' }); } });
  map.on('moveend', function () {
    var center = map.getCenter().wrap();
    send({ type: 'moveEnd', center: { latitude: round(center.lat), longitude: round(center.lng) }, zoom: map.getZoom(), byUser: !programmatic });
    programmatic = false;
  });

  function receive(raw) {
    var message;
    try { message = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!message || typeof message.type !== 'string') { return; }
    switch (message.type) {
      case 'setView': setView(message.center, message.zoom); break;
      case 'fitBounds': fitBounds(message.points); break;
      case 'setMarkers': state.markers = message.markers; drawMarkers(); break;
      case 'setRoute': state.route = message.route; drawRoute(); break;
      case 'setGeofence': state.geofence = message.geofence; drawFence(); break;
      case 'setTheme': state.palette = message.palette; applyTheme(); drawMarkers(); drawRoute(); drawFence(); break;
    }
  }
  window.waggoReceive = receive;
  window.addEventListener('message', function (event) {
    if (window.parent !== window && event.source !== window.parent) { return; }
    receive(event.data);
  });

  applyTheme();
  setView(config.center, config.zoom);
  send({ type: 'ready' });
})();
`;

/**
 * The map page: Leaflet (pinned, with SRI) over raster tiles, the same HTML for the WebView (iOS/Android) and the
 * iframe (web). Pure: the same options give the same string, so it is built once per mount and tested as text.
 */
export function buildMapHtml(options: MapHtmlOptions): string {
  const config = {
    center: options.center,
    zoom: options.zoom,
    tileUrl: options.tileUrl,
    interactive: options.interactive,
    palette: options.palette,
    attribution: OSM_ATTRIBUTION,
  };
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="stylesheet" href="${LEAFLET.css}" integrity="${LEAFLET.cssIntegrity}" crossorigin="anonymous">
<style>${STYLE}</style>
</head>
<body>
<div id="map"></div>
<script>window.__WAGGO_MAP__ = ${scriptJson(config)};</script>
<script src="${LEAFLET.js}" integrity="${LEAFLET.jsIntegrity}" crossorigin="anonymous"></script>
<script>${SCRIPT}</script>
</body>
</html>`;
}
