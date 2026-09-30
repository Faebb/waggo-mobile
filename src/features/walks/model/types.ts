import type { WalkType } from '@/features/pricing';

/** Mirrors the backend enum `WalkStatus` (waggo-api › Waggo.Domain.Enums.Walks). */
export const WALK_STATUSES = ['Requested', 'Accepted', 'InProgress', 'Completed', 'Cancelled'] as const;
export type WalkStatus = (typeof WALK_STATUSES)[number];

/** Short label for lists. */
export const WALK_STATUS_LABELS: Record<WalkStatus, string> = {
  Requested: 'Buscando paseador',
  Accepted: 'Paseador en camino',
  InProgress: 'En curso',
  Completed: 'Terminado',
  Cancelled: 'Cancelado',
};

/** Big headline of the walk screen, like a ride app. */
export const WALK_STATUS_HEADLINES: Record<WalkStatus, string> = {
  Requested: 'Buscando paseador…',
  Accepted: 'Tu paseador va en camino',
  InProgress: 'Paseo en curso',
  Completed: 'Paseo terminado',
  Cancelled: 'Paseo cancelado',
};

/** Walks that are still going on: the home shows them and the walk screen keeps refreshing. */
export const ACTIVE_STATUSES: readonly WalkStatus[] = ['Requested', 'Accepted', 'InProgress'];

/** The owner can cancel before the walk starts. */
export const CANCELLABLE_STATUSES: readonly WalkStatus[] = ['Requested', 'Accepted'];

/** A walk as the API returns it (`WalkResponse`). Dates are ISO strings. */
export type Walk = {
  id: string;
  status: WalkStatus;
  petIds: string[];
  walkType: WalkType;
  durationMinutes: number;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  scheduledFor: string;
  notes: string | null;
  currency: string;
  total: number;
  commission: number;
  walkerPayout: number;
  walkerId: string | null;
  requestedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

/** Body of `POST /api/v1/walks`. `scheduledFor` null means now. */
export type WalkDraft = {
  petIds: string[];
  walkType: WalkType;
  durationMinutes: number;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  scheduledFor: string | null;
  notes: string | null;
};
