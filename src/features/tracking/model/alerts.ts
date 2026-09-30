/** Mirrors `WalkAlertResponse` (RF-012). */
export const ALERT_KINDS = ['Emergency', 'Geofence', 'Anomaly'] as const;
export const ALERT_PARTIES = ['Owner', 'Walker'] as const;
export type AlertParty = (typeof ALERT_PARTIES)[number];

export type WalkAlert = {
  id: string;
  kind: (typeof ALERT_KINDS)[number];
  /** Null when the platform raised it (geofence, anomaly). */
  raisedBy: AlertParty | null;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  raisedAt: string;
};

/** Body of `POST /api/v1/walks/{id}/emergency`: everything optional, one tap must be enough. */
export type EmergencyDraft = { message?: string; latitude?: number; longitude?: number };

/**
 * "El paseador reportó una emergencia", "Reportaste una emergencia" for whoever raised it, or what the platform
 * detected on its own (RF-009, RF-010).
 */
export function alertTitleFor(alert: Pick<WalkAlert, 'kind' | 'raisedBy'>, viewer: AlertParty): string {
  if (alert.kind === 'Geofence') {
    return 'El paseo salió de la zona acordada';
  }
  if (alert.kind === 'Anomaly') {
    return 'El paseo lleva 10 minutos detenido';
  }
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
