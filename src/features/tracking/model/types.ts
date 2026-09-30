/** A recorded position of the route (`RoutePointResponse`). */
export type RoutePoint = { latitude: number; longitude: number; recordedAt: string };

/** Route of a walk with its summary (`RouteResponse`, RF-008 and RF-011). */
export type Route = { points: RoutePoint[]; distanceKm: number; elapsedMinutes: number };

/** A position the walker's phone sends. */
export type TrackPointDraft = { latitude: number; longitude: number; recordedAt: string };
