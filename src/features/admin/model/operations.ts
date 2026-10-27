/**
 * Admin "Operación" view (spec RF-002/RF-003 panel, slices 2–3; design proposal 07 · 36). The shapes are what the
 * screen needs to draw; there is NO endpoint for them yet (waggo-api only has `GET /walks/{id}/alerts`, per walk),
 * so they are the front-end side of a contract still to be specified, not a mirror of an existing response.
 */
export type OperationAlert = {
  id: string;
  walkId: string;
  /** Same kinds as `WalkAlertResponse` (RF-009/RF-010/RF-012). */
  kind: 'Emergency' | 'Geofence' | 'Anomaly';
  petName: string;
  walkerName: string;
  ownerName: string;
  raisedAt: string;
};

export type ActiveWalkSummary = {
  walkId: string;
  petName: string;
  walkerName: string;
  area: string;
  status: 'Accepted' | 'InProgress';
  elapsedMinutes: number;
  durationMinutes: number;
  /** Last tracking point; null when none arrived yet. */
  lastSignalAt: string | null;
};

export type AdminOperations = {
  /** False until waggo-api exposes the global alerts and active-walks endpoints. */
  available: boolean;
  alerts: OperationAlert[];
  activeWalks: ActiveWalkSummary[];
};
