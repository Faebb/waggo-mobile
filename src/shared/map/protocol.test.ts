import { encodeCommand, parseMapEvent } from './protocol';

const center = { latitude: 9.411, longitude: -73.597 };

describe('parseMapEvent (map → app)', () => {
  it('reads the events the map page sends', () => {
    expect(parseMapEvent('{"type":"ready"}')).toEqual({ type: 'ready' });
    expect(parseMapEvent(JSON.stringify({ type: 'moveEnd', center, zoom: 15, byUser: true }))).toEqual({
      type: 'moveEnd',
      center,
      zoom: 15,
      byUser: true,
    });
    expect(parseMapEvent('{"type":"markerTap","id":"walk-1"}')).toEqual({ type: 'markerTap', id: 'walk-1' });
    expect(parseMapEvent('{"type":"tileError"}')).toEqual({ type: 'tileError' });
    expect(parseMapEvent('{"type":"error","message":"leaflet"}')).toEqual({ type: 'error', message: 'leaflet' });
  });

  it('ignores anything that is not a valid event (other scripts, bad JSON, out of range)', () => {
    expect(parseMapEvent('not json')).toBeNull();
    expect(parseMapEvent('{"type":"hack"}')).toBeNull();
    expect(
      parseMapEvent(JSON.stringify({ type: 'moveEnd', center: { latitude: 120, longitude: 0 }, zoom: 3 })),
    ).toBeNull();
    expect(parseMapEvent(42)).toBeNull();
  });
});

describe('encodeCommand (app → map)', () => {
  it('serializes a valid command as JSON', () => {
    expect(JSON.parse(encodeCommand({ type: 'setView', center, zoom: 7 }))).toEqual({
      type: 'setView',
      center,
      zoom: 7,
    });
  });

  it('refuses an invalid command instead of sending it', () => {
    expect(() => encodeCommand({ type: 'setView', center: { latitude: 200, longitude: 0 }, zoom: 7 })).toThrow();
    expect(() =>
      encodeCommand({
        type: 'setMarkers',
        markers: [{ id: 'x', kind: 'unknown' as 'pickup', position: center, label: 'x' }],
      }),
    ).toThrow();
  });
});
