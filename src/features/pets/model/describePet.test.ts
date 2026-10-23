import { describeAge, describePet } from './describePet';

describe('describePet', () => {
  it('joins size, breed and weight with a decimal comma', () => {
    expect(describePet({ size: 'Medium', breed: 'Criolla', weightKg: 14.5 })).toBe('Mediano · Criolla · 14,5 kg');
  });

  it('leaves out the missing data', () => {
    expect(describePet({ size: 'Small', breed: null, weightKg: null })).toBe('Pequeño');
  });
});

describe('describeAge', () => {
  const today = new Date(2026, 9, 23);

  it('counts whole years, months or less than a month', () => {
    expect(describeAge('2021-05-10', today)).toBe('5 años');
    expect(describeAge('2025-10-23', today)).toBe('1 año');
    expect(describeAge('2026-05-24', today)).toBe('4 meses');
    expect(describeAge('2026-09-23', today)).toBe('1 mes');
    expect(describeAge('2026-10-10', today)).toBe('Menos de 1 mes');
  });

  it('is empty without a birth date', () => {
    expect(describeAge(null, today)).toBeNull();
  });
});
