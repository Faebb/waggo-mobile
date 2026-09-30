import type { PaymentStatus, PaymentViewer } from './types';

const TEXTS: Record<PaymentViewer, Record<PaymentStatus, string>> = {
  Owner: {
    Held: 'Retenido: se cobra al terminar',
    Captured: 'Pagado',
    Released: 'Liberado: no se cobró',
  },
  Walker: {
    Held: 'Se paga al terminar',
    Captured: 'Pagado a tu cuenta',
    Released: 'Sin cobro: se canceló',
  },
};

/** RF-016: where the money is, in the words of each side of the walk. */
export function paymentTextFor(viewer: PaymentViewer, status: PaymentStatus): string {
  return TEXTS[viewer][status];
}
