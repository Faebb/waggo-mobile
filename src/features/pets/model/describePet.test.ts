import { describePet } from './describePet';

describe('describePet', () => {
  it('joins size, breed and weight with a decimal comma', () => {
    expect(describePet({ size: 'Medium', breed: 'Criolla', weightKg: 14.5 })).toBe('Mediano · Criolla · 14,5 kg');
  });

  it('leaves out the missing data', () => {
    expect(describePet({ size: 'Small', breed: null, weightKg: null })).toBe('Pequeño');
  });
});
