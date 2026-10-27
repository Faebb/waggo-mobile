import type { AdminOperations } from '../model/operations';

const COMING_SOON: AdminOperations = { available: false, alerts: [], activeWalks: [] };

/**
 * Data of the admin "Operación" view. Today it always answers "not available": waggo-api has no global endpoint
 * for active alerts or walks in progress (spec RF-002/RF-003 panel, slices 2–3). When it exists, replace this with a
 * TanStack Query hook over that endpoint (polling like the walk screens) and keep the same return shape.
 */
export function useAdminOperations(): AdminOperations {
  return COMING_SOON;
}
