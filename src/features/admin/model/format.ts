const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "hace 2 min", "hace 5 h", "hace 2 días" (design proposal 07 · 35–36). */
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const elapsed = now.getTime() - new Date(iso).getTime();
  if (elapsed < MINUTE) return 'hace un momento';
  if (elapsed < HOUR) return `hace ${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < DAY) return `hace ${Math.floor(elapsed / HOUR)} h`;
  const days = Math.floor(elapsed / DAY);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}

/** A 10-digit Colombian mobile reads "300 123 4567"; anything else is shown as the walker typed it. */
export function formatPhone(phone: string): string {
  const match = /^(\d{3})(\d{3})(\d{4})$/.exec(phone);
  return match === null ? phone : `${match[1]} ${match[2]} ${match[3]}`;
}
