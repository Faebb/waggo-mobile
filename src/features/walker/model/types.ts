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
