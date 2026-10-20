import { paymentTextFor } from './paymentText';

describe('paymentTextFor (RF-016)', () => {
  it.each([
    ['Owner', 'Held', 'Retenido: se cobra al terminar'],
    ['Owner', 'Captured', 'Pagado'],
    ['Owner', 'Released', 'Liberado: no se cobró'],
    ['Walker', 'Held', 'Se paga al terminar'],
    ['Walker', 'Captured', 'Pagado a tu cuenta'],
    ['Walker', 'Released', 'Sin cobro: se canceló'],
  ] as const)('%s sees a %s payment as "%s"', (viewer, status, text) => {
    expect(paymentTextFor(viewer, status)).toBe(text);
  });
});
