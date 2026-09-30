export const PAYMENT_STATUSES = ['Held', 'Captured', 'Released'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Who looks at the payment: the owner pays, the walker gets paid. */
export type PaymentViewer = 'Owner' | 'Walker';

/** The payment of a walk (`WalkPaymentResponse`). */
export type WalkPayment = {
  walkId: string;
  status: PaymentStatus;
  currency: string;
  total: number;
  commission: number;
  walkerPayout: number;
  heldAt: string;
  capturedAt: string | null;
  releasedAt: string | null;
};

/** What a walker earned (`WalkerEarningsResponse`). `currency` is null while there are no earnings. */
export type WalkerEarnings = {
  currency: string | null;
  total: number;
  walks: { walkId: string; walkerPayout: number; capturedAt: string }[];
};
