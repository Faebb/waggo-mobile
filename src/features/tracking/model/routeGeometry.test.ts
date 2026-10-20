import { projectRoute } from './routeGeometry';

const box = { width: 300, height: 200, padding: 20 };

describe('projectRoute (RF-008)', () => {
  it('fits the route inside the box, north up', () => {
    const points = projectRoute(
      [
        { latitude: 4.6361, longitude: -74.0645 },
        { latitude: 4.645, longitude: -74.0645 },
      ],
      box,
    );

    expect(points).toHaveLength(2);
    for (const { x, y } of points) {
      expect(x).toBeGreaterThanOrEqual(20);
      expect(x).toBeLessThanOrEqual(280);
      expect(y).toBeGreaterThanOrEqual(20);
      expect(y).toBeLessThanOrEqual(180);
    }
    // Going north moves up on the screen.
    expect(points[1]!.y).toBeLessThan(points[0]!.y);
  });

  it('keeps the proportions: a walk to the east is wider than tall', () => {
    const [start, end] = projectRoute(
      [
        { latitude: 4.6361, longitude: -74.0645 },
        { latitude: 4.6361, longitude: -74.05 },
      ],
      box,
    );

    expect(Math.abs(end!.x - start!.x)).toBeGreaterThan(200);
    expect(end!.y).toBe(start!.y);
  });

  it('puts a single position in the middle', () => {
    expect(projectRoute([{ latitude: 4.6361, longitude: -74.0645 }], box)).toEqual([{ x: 150, y: 100 }]);
  });

  it('returns nothing for no positions', () => {
    expect(projectRoute([], box)).toEqual([]);
  });
});
