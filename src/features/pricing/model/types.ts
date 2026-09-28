/** Mirrors the backend enum `WalkType` (waggo-api › Waggo.Domain.Pricing). */
export const WALK_TYPES = ['Individual', 'Group'] as const;
export type WalkType = (typeof WALK_TYPES)[number];

export const WALK_TYPE_LABELS: Record<WalkType, string> = {
  Individual: 'Individual',
  Group: 'Grupal',
};

/** Valid durations: 30–120 minutes in steps of 15 (backend rule `WalkDuration`). */
export const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const;
export type DurationMinutes = (typeof DURATION_OPTIONS)[number];

export type FareQuote = {
  walkType: WalkType;
  durationMinutes: number;
  currency: string;
  total: number;
  commission: number;
  walkerPayout: number;
};
