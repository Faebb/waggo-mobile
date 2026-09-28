import { formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it.each([
    [0, '$ 0'],
    [999, '$ 999'],
    [1500, '$ 1.500'],
    [23000, '$ 23.000'],
    [1234567, '$ 1.234.567'],
  ])('formats %p COP as %p', (amount, expected) => {
    expect(formatMoney(amount, 'COP')).toBe(expected);
  });

  it('rounds to whole pesos', () => {
    expect(formatMoney(2360.6, 'COP')).toBe('$ 2.361');
  });

  it('appends the currency code when it is not COP', () => {
    expect(formatMoney(10, 'USD')).toBe('$ 10 USD');
  });
});
