import { scheduledForOf, WHEN_OPTIONS } from './whenOptions';

// Wednesday 30 September 2026, 10:20 in Bogotá (UTC-5).
const now = new Date('2026-09-30T15:20:00Z');

describe('whenOptions (RF-007)', () => {
  it('offers now, in one hour and tomorrow morning or afternoon', () => {
    expect(WHEN_OPTIONS.map((option) => option.label)).toEqual(['Ahora', 'En 1 hora', 'Mañana 8:00', 'Mañana 17:00']);
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
});
