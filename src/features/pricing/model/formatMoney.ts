/**
 * Formats an amount in Colombian style: "$ 23.000".
 * Implemented without Intl on purpose so the output is identical on Hermes (iOS/Android), web and Jest.
 */
export function formatMoney(amount: number, currency: string): string {
  const whole = Math.round(amount).toString();
  const withThousands = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const suffix = currency === 'COP' ? '' : ` ${currency}`;
  return `$ ${withThousands}${suffix}`;
}
