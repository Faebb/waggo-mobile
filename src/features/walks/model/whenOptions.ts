import { parseDateText } from '@/shared/ui/DateField';

/** Quick choices for when the walk happens, like "now" or "schedule" in a ride app, plus "Otra fecha". */
export const WHEN_OPTIONS = [
  { value: 'now', label: 'Ahora' },
  { value: 'inOneHour', label: 'En 1 hora' },
  { value: 'tomorrowMorning', label: 'Mañana 8:00' },
  { value: 'tomorrowAfternoon', label: 'Mañana 17:00' },
  { value: 'other', label: 'Otra fecha' },
] as const;

export type When = (typeof WHEN_OPTIONS)[number]['value'];
/** The choices that need no date typed by the owner. */
export type QuickWhen = Exclude<When, 'other'>;

/**
 * ⚠️ provisional (RF-007): how many days ahead a walk can be scheduled. It mirrors the rule in force in the API
 * (`Walk.MaxDaysAhead` = 5: the card authorization could expire before a later walk). The design says "hasta 14
 * días" (proposal 07 · 12), which the API would reject with `Walks.InvalidSchedule`.
 */
export const MAX_DAYS_AHEAD = 5;

/** ISO date to send as `scheduledFor`. "now" sends null, so the API uses its own clock. */
export function scheduledForOf(when: QuickWhen, now: Date = new Date()): string | null {
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

/** "1430" → "14:30" as the user types: digits only (at most 4) and the colon, so a number pad is enough. */
export function formatTimeText(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** "14:30" (24 hours) → `{ hours: 14, minutes: 30 }`; `null` when it is not a valid time. */
export function parseTimeText(text: string): { hours: number; minutes: number } | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
  if (match === null) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export type OtherDateErrors = Partial<Record<'date' | 'time', string>>;
export type OtherDateResult = { ok: true; scheduledFor: string } | { ok: false; errors: OtherDateErrors };

/**
 * "Otra fecha": the date (DD/MM/AAAA) and time (HH:MM) typed by the owner, in the device time zone, as the ISO
 * `scheduledFor`, or the message for each wrong field. It must be later than now and within `MAX_DAYS_AHEAD`.
 */
export function otherDateOf(dateText: string, timeText: string, now: Date = new Date()): OtherDateResult {
  const day = parseDateText(dateText);
  const time = parseTimeText(timeText);
  const errors: OtherDateErrors = {};
  if (day === null) errors.date = 'Escribe una fecha real como día/mes/año, por ejemplo 02/10/2026.';
  if (time === null) errors.time = 'Escribe la hora de 0:00 a 23:59, por ejemplo 14:30.';
  if (day === null || time === null) return { ok: false, errors };

  const [year, month, date] = day.split('-').map(Number) as [number, number, number];
  const scheduled = new Date(year, month - 1, date, time.hours, time.minutes);
  const latest = new Date(now);
  latest.setDate(latest.getDate() + MAX_DAYS_AHEAD);

  if (scheduled.getTime() <= now.getTime()) {
    return { ok: false, errors: { date: 'Elige una fecha y hora que todavía no hayan pasado.' } };
  }
  if (scheduled.getTime() > latest.getTime()) {
    return { ok: false, errors: { date: `Puedes programar el paseo hasta ${MAX_DAYS_AHEAD} días desde ahora.` } };
  }
  return { ok: true, scheduledFor: scheduled.toISOString() };
}
