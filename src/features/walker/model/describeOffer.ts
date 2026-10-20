import { WALK_TYPE_LABELS, type WalkType } from '@/features/pricing';

/** "Individual · 60 min · 1 perro" */
export function offerKindOf(offer: { walkType: WalkType; durationMinutes: number; petCount: number }): string {
  const pets = offer.petCount === 1 ? '1 perro' : `${offer.petCount} perros`;
  return `${WALK_TYPE_LABELS[offer.walkType]} · ${offer.durationMinutes} min · ${pets}`;
}

/** "a 1,1 km", with a decimal comma. */
export function formatDistance(distanceKm: number): string {
  return `a ${distanceKm.toFixed(1).replace('.', ',')} km`;
}
