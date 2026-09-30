/** Quick choices for when the walk happens, like "now" or "schedule" in a ride app. */
export const WHEN_OPTIONS = [
  { value: 'now', label: 'Ahora' },
  { value: 'inOneHour', label: 'En 1 hora' },
  { value: 'tomorrowMorning', label: 'Mañana 8:00' },
  { value: 'tomorrowAfternoon', label: 'Mañana 17:00' },
] as const;

export type When = (typeof WHEN_OPTIONS)[number]['value'];

/** ISO date to send as `scheduledFor`. "now" sends null, so the API uses its own clock. */
export function scheduledForOf(when: When, now: Date = new Date()): string | null {
  switch (when) {
    case 'now':
      return null;
    case 'inOneHour':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case 'tomorrowMorning':
      return tomorrowAt(now, 8);
    case 'tomorrowAfternoon':
      return tomorrowAt(now, 17);
  }
}

function tomorrowAt(now: Date, hour: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}
