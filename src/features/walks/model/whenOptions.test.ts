import {
  formatTimeText,
  MAX_DAYS_AHEAD,
  otherDateOf,
  parseTimeText,
  scheduledForOf,
  WHEN_OPTIONS,
} from './whenOptions';

// Wednesday 30 September 2026, 10:20 in Bogotá (UTC-5).
const now = new Date('2026-09-30T15:20:00Z');

/** "DD/MM/AAAA" of `now` plus `days`, in the device time zone (what the owner types). */
function dateTextIn(days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

describe('whenOptions (RF-007)', () => {
  it('offers now, in one hour, tomorrow morning or afternoon and another date (design 07 · 12)', () => {
    expect(WHEN_OPTIONS.map((option) => option.label)).toEqual([
      'Ahora',
      'En 1 hora',
      'Mañana 8:00',
      'Mañana 17:00',
      'Otra fecha',
    ]);
  });

  it('sends no date for "now", so the API uses its own clock', () => {
    expect(scheduledForOf('now', now)).toBeNull();
  });

  it('adds one hour', () => {
    expect(scheduledForOf('inOneHour', now)).toBe('2026-09-30T16:20:00.000Z');
  });

  it('uses tomorrow at the given local hour', () => {
    const tomorrowMorning = new Date(scheduledForOf('tomorrowMorning', now)!);

    expect(tomorrowMorning.getDate()).toBe(new Date(now.getTime() + 24 * 3600 * 1000).getDate());
    expect(tomorrowMorning.getHours()).toBe(8);
    expect(tomorrowMorning.getMinutes()).toBe(0);
  });

  it('follows the API horizon of 5 days (Walk.MaxDaysAhead), not the 14 days of the design', () => {
    expect(MAX_DAYS_AHEAD).toBe(5);
  });
});

describe('time typed as HH:MM, 24 hours', () => {
  it.each([
    ['1430', '14:30'],
    ['14:30', '14:30'],
    ['08', '08'],
    ['083099', '08:30'],
  ])('formats "%s" as "%s" while typing', (typed, shown) => {
    expect(formatTimeText(typed)).toBe(shown);
  });

  it.each([
    ['14:30', { hours: 14, minutes: 30 }],
    ['8:05', { hours: 8, minutes: 5 }],
    ['00:00', { hours: 0, minutes: 0 }],
    ['23:59', { hours: 23, minutes: 59 }],
  ])('reads "%s"', (text, time) => {
    expect(parseTimeText(text)).toEqual(time);
  });

  it.each(['24:00', '12:60', '7', '', 'ab:cd'])('rejects "%s"', (text) => {
    expect(parseTimeText(text)).toBeNull();
  });
});

describe('otherDateOf ("Otra fecha")', () => {
  it('turns the local date and time into the ISO `scheduledFor`', () => {
    const result = otherDateOf(dateTextIn(2), '08:30', now);

    expect(result.ok).toBe(true);
    const scheduled = new Date(result.ok ? result.scheduledFor : '');
    expect(scheduled.getDate()).toBe(new Date(now.getTime() + 2 * 24 * 3600 * 1000).getDate());
    expect(scheduled.getHours()).toBe(8);
    expect(scheduled.getMinutes()).toBe(30);
  });

  it('asks for a real date and a valid time', () => {
    expect(otherDateOf('31/02/2026', '25:00', now)).toEqual({
      ok: false,
      errors: {
        date: 'Escribe una fecha real como día/mes/año, por ejemplo 02/10/2026.',
        time: 'Escribe la hora de 0:00 a 23:59, por ejemplo 14:30.',
      },
    });
  });

  it('rejects a moment that already passed', () => {
    expect(otherDateOf(dateTextIn(-1), '23:59', now)).toEqual({
      ok: false,
      errors: { date: 'Elige una fecha y hora que todavía no hayan pasado.' },
    });
  });

  it('rejects more than 5 days ahead', () => {
    expect(otherDateOf(dateTextIn(6), '08:00', now)).toEqual({
      ok: false,
      errors: { date: 'Puedes programar el paseo hasta 5 días desde ahora.' },
    });
  });

  it('accepts up to the last minute of the horizon', () => {
    const justBefore = new Date(now.getTime() - 60 * 1000);
    const time = `${String(justBefore.getHours()).padStart(2, '0')}:${String(justBefore.getMinutes()).padStart(2, '0')}`;

    expect(otherDateOf(dateTextIn(5), time, now).ok).toBe(true);
  });
});
