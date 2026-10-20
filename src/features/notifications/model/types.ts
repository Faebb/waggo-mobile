export const NOTIFICATION_KINDS = [
  'WalkAccepted',
  'WalkStarted',
  'WalkFinished',
  'WalkPaid',
  'WalkCancelled',
  'Emergency',
  'Geofence',
  'Anomaly',
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** A notice about a moment of a walk (`NotificationResponse`). */
export type AppNotification = {
  id: string;
  walkId: string;
  recipientParty: 'Owner' | 'Walker';
  kind: NotificationKind;
  priority: 'Normal' | 'High';
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

/** The inbox (`NotificationsResponse`). */
export type NotificationInbox = { unreadCount: number; items: AppNotification[] };
