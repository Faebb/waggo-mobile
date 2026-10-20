import { formatWhen, petNamesOf, walkKindOf } from './describeWalk';

const pets = [
  { id: 'a', name: 'Luna' },
  { id: 'b', name: 'Max' },
  { id: 'c', name: 'Toby' },
];

describe('describeWalk', () => {
  it.each([
    [['a'], 'Luna'],
    [['a', 'b'], 'Luna y Max'],
    [['a', 'b', 'c'], 'Luna, Max y Toby'],
    [['x'], 'Tu perro'],
  ])('names the dogs %j as "%s"', (ids, expected) => {
    expect(petNamesOf(ids, pets)).toBe(expected);
  });

  it('describes the kind of walk', () => {
    expect(walkKindOf({ walkType: 'Group', durationMinutes: 45 })).toBe('Grupal · 45 min');
  });

  it('says today, tomorrow or the date', () => {
    const now = new Date(2026, 8, 30, 10, 0);

    expect(formatWhen(new Date(2026, 8, 30, 10, 20).toISOString(), now)).toBe('Hoy, 10:20');
    expect(formatWhen(new Date(2026, 9, 1, 8, 0).toISOString(), now)).toBe('Mañana, 8:00');
    expect(formatWhen(new Date(2026, 9, 2, 17, 5).toISOString(), now)).toBe('vie 2 oct, 17:05');
  });
});
