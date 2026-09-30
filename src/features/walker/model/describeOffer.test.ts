import { formatDistance, offerKindOf } from './describeOffer';

describe('describeOffer', () => {
  it('describes the kind of walk with the number of dogs', () => {
    expect(offerKindOf({ walkType: 'Individual', durationMinutes: 60, petCount: 1 })).toBe(
      'Individual · 60 min · 1 perro',
    );
    expect(offerKindOf({ walkType: 'Group', durationMinutes: 45, petCount: 3 })).toBe('Grupal · 45 min · 3 perros');
  });

  it('formats the distance with one decimal and a comma', () => {
    expect(formatDistance(1.14)).toBe('a 1,1 km');
    expect(formatDistance(12)).toBe('a 12,0 km');
  });
});
