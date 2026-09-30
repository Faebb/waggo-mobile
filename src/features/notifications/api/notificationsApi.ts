import { z } from 'zod';

import { httpClient, type HttpClient } from '@/shared/api/httpClient';

import { NOTIFICATION_KINDS, type NotificationInbox } from '../model/types';

export const notificationInboxSchema = z.object({
  unreadCount: z.number().int(),
  items: z.array(
    z.object({
      id: z.string(),
      walkId: z.string(),
      recipientParty: z.enum(['Owner', 'Walker']),
      kind: z.enum(NOTIFICATION_KINDS),
      priority: z.enum(['Normal', 'High']),
      title: z.string(),
      body: z.string(),
      createdAt: z.string(),
      readAt: z.string().nullable(),
    }),
  ),
}) satisfies z.ZodType<NotificationInbox>;

/** RF-014 — GET /api/v1/notifications: unread count and the latest notices, newest first. */
export async function listNotifications(client: HttpClient = httpClient): Promise<NotificationInbox> {
  const { data } = await client.get('/api/v1/notifications', notificationInboxSchema);
  return data;
}

/** RF-014 — POST /api/v1/notifications/read: everything in the inbox is read. */
export async function markNotificationsRead(client: HttpClient = httpClient): Promise<NotificationInbox> {
  const { data } = await client.post('/api/v1/notifications/read', {}, notificationInboxSchema);
  return data;
}
