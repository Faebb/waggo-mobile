type LatLng = { latitude: number; longitude: number };
type Box = { width: number; height: number; padding: number };

/**
 * Projects GPS positions onto a drawing box, north up, keeping the real proportions (a simple equirectangular
 * projection is enough for the few kilometers of a walk). There is no base map yet: this draws the route alone.
 */
export function projectRoute(points: readonly LatLng[], box: Box): { x: number; y: number }[] {
  if (points.length === 0) {
    return [];
  }

  const meanLatitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const shrink = Math.cos((meanLatitude * Math.PI) / 180);
  const planar = points.map((point) => ({ x: point.longitude * shrink, y: point.latitude }));

  const xs = planar.map((point) => point.x);
  const ys = planar.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;

  const innerWidth = box.width - 2 * box.padding;
  const innerHeight = box.height - 2 * box.padding;
  const scale = Math.min(
    spanX > 0 ? innerWidth / spanX : Number.POSITIVE_INFINITY,
    spanY > 0 ? innerHeight / spanY : Number.POSITIVE_INFINITY,
  );
  const factor = Number.isFinite(scale) ? scale : 0;

  // Center the drawing in the box.
  const offsetX = box.padding + (innerWidth - spanX * factor) / 2;
  const offsetY = box.padding + (innerHeight - spanY * factor) / 2;

  return planar.map((point) => ({
    x: round(offsetX + (point.x - minX) * factor),
    y: round(offsetY + (minY + spanY - point.y) * factor),
  }));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
