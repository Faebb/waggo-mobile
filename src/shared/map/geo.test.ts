import { blockCenterOf, distanceMeters, formatDistance, isOutside, sameView } from './geo';

const pickup = { latitude: 4.6361, longitude: -74.0645 };

describe('distanceMeters', () => {
  it('is zero for the same point', () => {
    expect(distanceMeters(pickup, pickup)).toBe(0);
  });

  it('measures about 990 m for 0.0089° of latitude (RF-008 example)', () => {
    expect(distanceMeters(pickup, { latitude: 4.645, longitude: -74.0645 })).toBeCloseTo(990, -1);
  });
});

describe('isOutside (geofence, RF-009)', () => {
  const fence = { center: pickup, radiusMeters: 1500 };

  it('is false inside the zone and true beyond its radius', () => {
    expect(isOutside(fence, { latitude: 4.645, longitude: -74.0645 })).toBe(false);
    expect(isOutside(fence, { latitude: 4.6561, longitude: -74.0645 })).toBe(true);
  });
});

describe('formatDistance', () => {
  it('says meters under one kilometer and kilometers with a comma above', () => {
    expect(formatDistance(450.4)).toBe('450 m');
    expect(formatDistance(1234)).toBe('1,2 km');
  });
});

describe('blockCenterOf', () => {
  it('rounds to about one block (3 decimals) so a request does not reveal the exact house', () => {
    expect(blockCenterOf({ latitude: 4.63614, longitude: -74.06456 })).toEqual({ latitude: 4.636, longitude: -74.065 });
  });
});

describe('sameView', () => {
  it('treats sub-centimeter differences as the same view', () => {
    expect(sameView({ center: pickup, zoom: 15 }, { center: { ...pickup, latitude: 4.6361000001 }, zoom: 15 })).toBe(
      true,
    );
    expect(sameView({ center: pickup, zoom: 15 }, { center: pickup, zoom: 16 })).toBe(false);
    expect(sameView(null, { center: pickup, zoom: 15 })).toBe(false);
  });
});
