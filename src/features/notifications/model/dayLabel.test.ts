import { dayLabelOf } from './dayLabel';

describe('dayLabelOf (RF-014, notices grouped by day)', () => {
  const now = new Date(2026, 9, 27, 18, 0);

  it('says "Hoy" and "Ayer" for the last two days', () => {
    expect(dayLabelOf(new Date(2026, 9, 27, 8, 0).toISOString(), now)).toBe('Hoy');
    expect(dayLabelOf(new Date(2026, 9, 26, 23, 0).toISOString(), now)).toBe('Ayer');
  });

  it('gives the weekday and date for older notices', () => {
    expect(dayLabelOf(new Date(2026, 9, 2, 10, 0).toISOString(), now)).toBe('vie 2 oct');
  });
});
