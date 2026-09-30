/** Mirrors `WalkAlertResponse` (RF-012). */
export const ALERT_KINDS = ['Emergency'] as const;
export const ALERT_PARTIES = ['Owner', 'Walker'] as const;
export type AlertParty = (typeof ALERT_PARTIES)[number];

export type WalkAlert = {
  id: string;
  kind: (typeof ALERT_KINDS)[number];
  raisedBy: AlertParty;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  raisedAt: string;
};

/** Body of `POST /api/v1/walks/{id}/emergency`: everything optional, one tap must be enough. */
export type EmergencyDraft = { message?: string; latitude?: number; longitude?: number };

/** "El paseador reportó una emergencia", or "Reportaste una emergencia" for whoever raised it. */
export function alertTitleFor(alert: Pick<WalkAlert, 'raisedBy'>, viewer: AlertParty): string {
  if (alert.raisedBy === viewer) {
    return 'Reportaste una emergencia';
  }
  return alert.raisedBy === 'Walker' ? 'El paseador reportó una emergencia' : 'El dueño reportó una emergencia';
}

/** "15:10" in the device time zone (no Intl, same output everywhere). */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}
