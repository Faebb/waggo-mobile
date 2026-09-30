/** "0,99 km" */
export function formatKm(distanceKm: number): string {
  return `${distanceKm.toFixed(2).replace('.', ',')} km`;
}

/** "18 min" */
export function formatMinutes(minutes: number): string {
  return `${minutes} min`;
}
