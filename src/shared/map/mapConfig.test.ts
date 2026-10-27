import { DEFAULT_TILE_URL, OSM_ATTRIBUTION, resolveTileUrl } from './mapConfig';

describe('resolveTileUrl', () => {
  it('uses the public OpenStreetMap tiles when nothing is configured', () => {
    expect(resolveTileUrl(undefined)).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(resolveTileUrl('')).toBe(DEFAULT_TILE_URL);
  });

  it('takes a configured https template with {z}, {x} and {y}', () => {
    expect(resolveTileUrl('https://tiles.example.com/{z}/{x}/{y}.png')).toBe(
      'https://tiles.example.com/{z}/{x}/{y}.png',
    );
  });

  it('falls back to the default when the template is not https or misses a placeholder', () => {
    expect(resolveTileUrl('http://tiles.example.com/{z}/{x}/{y}.png')).toBe(DEFAULT_TILE_URL);
    expect(resolveTileUrl('https://tiles.example.com/{z}/{x}.png')).toBe(DEFAULT_TILE_URL);
    expect(resolveTileUrl('javascript:alert(1)//{z}{x}{y}')).toBe(DEFAULT_TILE_URL);
  });
});

describe('OSM_ATTRIBUTION', () => {
  it('credits the OpenStreetMap contributors with a link to the copyright page', () => {
    expect(OSM_ATTRIBUTION).toContain('© ');
    expect(OSM_ATTRIBUTION).toContain('OpenStreetMap</a> contributors');
    expect(OSM_ATTRIBUTION).toContain('https://www.openstreetmap.org/copyright');
  });
});
