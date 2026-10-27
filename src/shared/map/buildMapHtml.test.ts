import { buildMapHtml } from './buildMapHtml';
import { LEAFLET, OSM_ATTRIBUTION } from './mapConfig';
import { mapPaletteOf } from './mapPalette';
import { lightColors } from '../ui/theme';

const options = {
  center: { latitude: 9.411, longitude: -73.597 },
  zoom: 7,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  interactive: true,
  palette: mapPaletteOf(lightColors, 'light'),
};

describe('buildMapHtml', () => {
  it('loads a pinned Leaflet version with subresource integrity', () => {
    const html = buildMapHtml(options);

    expect(LEAFLET.js).toMatch(/leaflet\/1\.9\.4\/leaflet\.js$/);
    expect(html).toContain(`src="${LEAFLET.js}"`);
    expect(html).toContain(`integrity="${LEAFLET.jsIntegrity}"`);
    expect(html).toContain(`href="${LEAFLET.css}"`);
    expect(html).toContain(`integrity="${LEAFLET.cssIntegrity}"`);
    expect(html).not.toContain('latest');
  });

  it('passes the tile URL, the OSM attribution, the start view and the palette to the page', () => {
    const html = buildMapHtml(options);

    expect(html).toContain('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(html).toContain(JSON.stringify(OSM_ATTRIBUTION).slice(1, -1).replace(/</g, '\\u003c'));
    expect(html).toContain('"latitude":9.411');
    expect(html).toContain('"zoom":7');
    expect(html).toContain('"interactive":true');
    expect(html).toContain(lightColors.primary);
  });

  it('escapes "<" in the embedded data so a label cannot close the script', () => {
    const html = buildMapHtml({ ...options, tileUrl: 'https://x.test/{z}/{x}/{y}.png?</script><script>alert(1)' });

    expect(html).not.toContain('</script><script>alert(1)');
    expect(html).toContain('\\u003c/script>');
  });

  it('is the same for the same options (pure)', () => {
    expect(buildMapHtml(options)).toBe(buildMapHtml(options));
  });

  it('reports to the app when Leaflet cannot load and talks to both the WebView and the iframe parent', () => {
    const html = buildMapHtml(options);

    expect(html).toContain('ReactNativeWebView');
    expect(html).toContain('window.parent.postMessage');
    expect(html).toContain("type: 'error'");
    expect(html).toContain("type: 'tileError'");
  });
});
