import type { WalkType } from '@/features/pricing';

/** An open request as a walker sees it before accepting (`AvailableWalkResponse`). */
export type AvailableWalk = {
  id: string;
  walkType: WalkType;
  durationMinutes: number;
  petCount: number;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  scheduledFor: string;
  currency: string;
  walkerPayout: number;
  /** Straight-line distance to the walker, only when the walker shared a position. */
  distanceKm: number | null;
};

export const DOCUMENT_TYPES = ['CC', 'CE', 'PP'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CC: 'Cédula',
  CE: 'Cédula de extranjería',
  PP: 'Pasaporte',
};

export const VERIFICATION_STATUSES = ['Pending', 'Approved', 'Rejected'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** The walker's profile (`WalkerProfileResponse`). The document never comes back, only its last 4 digits. */
export type WalkerProfile = {
  id: string;
  fullName: string;
  documentType: DocumentType;
  documentLast4: string;
  phone: string;
  experience: string | null;
  status: VerificationStatus;
  rejectionReason: string | null;
  registeredAt: string;
};

/** Body of POST /api/v1/walkers/me. */
export type WalkerDraft = {
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  experience?: string;
};
