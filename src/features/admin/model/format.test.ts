import { formatPhone, formatTimeAgo } from './format';

const NOW = new Date('2026-10-02T08:00:00Z');

describe('formatTimeAgo', () => {
  it.each([
    ['2026-10-02T07:59:40Z', 'hace un momento'],
    ['2026-10-02T07:58:00Z', 'hace 2 min'],
    ['2026-10-02T03:00:00Z', 'hace 5 h'],
    ['2026-10-01T08:00:00Z', 'hace 1 día'],
    ['2026-09-30T08:00:00Z', 'hace 2 días'],
  ])('%s → %s', (iso, expected) => {
    expect(formatTimeAgo(iso, NOW)).toBe(expected);
  });
});

describe('formatPhone', () => {
  it('groups a Colombian mobile number as 3-3-4', () => {
    expect(formatPhone('3001234567')).toBe('300 123 4567');
  });

  it('leaves any other format as it came', () => {
    expect(formatPhone('+57 300 1234567')).toBe('+57 300 1234567');
  });
});
