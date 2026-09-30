import { createHttpClient } from '@/shared/api/httpClient';
import { acceptedNotification } from '@/test/fixtures';
import { envelopeResponse } from '@/test/mockApi';

import { listNotifications, markNotificationsRead } from './notificationsApi';

const inbox = { unreadCount: 1, items: [acceptedNotification] };

describe('notificationsApi (RF-014)', () => {
  it('reads the inbox', async () => {
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(inbox));

    await expect(listNotifications(createHttpClient('http://api', fetchFn))).resolves.toEqual(inbox);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/notifications', expect.anything());
  });

  it('marks everything as read with POST /api/v1/notifications/read', async () => {
    const read = { unreadCount: 0, items: [{ ...acceptedNotification, readAt: '2026-09-30T15:30:00+00:00' }] };
    const fetchFn = jest.fn().mockResolvedValue(envelopeResponse(read));

    await expect(markNotificationsRead(createHttpClient('http://api', fetchFn))).resolves.toEqual(read);
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/notifications/read',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
