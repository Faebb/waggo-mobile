import { View } from 'react-native';

import type { WalkStatus } from '@/features/walks';
import { DetailRow } from '@/shared/ui/DetailRow';

import { useWalkPayment } from '../hooks/usePayments';
import { paymentTextFor } from '../model/paymentText';
import type { PaymentViewer } from '../model/types';

type Props = { walkId: string; walkStatus: WalkStatus; viewer: PaymentViewer };

/**
 * RF-016: a "Pago" row with where the money of the walk is, next to the amount the screen already shows. Nothing
 * while loading, on error, or for a walk without payment.
 */
export function PaymentSummary({ walkId, walkStatus, viewer }: Props) {
  const payment = useWalkPayment(walkId, walkStatus);
  if (payment.data === null) {
    return <View testID="payment-empty" />;
  }
  if (payment.data === undefined) {
    return null;
  }
  return <DetailRow label="Pago" value={paymentTextFor(viewer, payment.data.status)} />;
}
