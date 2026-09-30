import { createHttpClient } from '@/shared/api/httpClient';

import { listMessages, sendMessage } from './messagesApi';

const message = { id: 'm1', sentBy: 'Owner', text: '¿Ya llegaste?', sentAt: '2026-09-30T15:00:00+00:00' };

const envelope = (data: unknown) => ({
  success: true,
  data,
  pagination: null,
  errors: [],
  warnings: [],
  infos: [],
  traceId: 't',
});

const respond = (data: unknown) =>
  jest.fn().mockResolvedValue(new Response(JSON.stringify(envelope(data)), { status: 200 }));

describe('messagesApi (RF-013)', () => {
  it('reads the chat of a walk', async () => {
    const fetchFn = respond([message]);

    await expect(listMessages('walk-1', createHttpClient('http://api', fetchFn))).resolves.toEqual([message]);
    expect(fetchFn).toHaveBeenCalledWith('http://api/api/v1/walks/walk-1/messages', expect.anything());
  });

  it('sends a message', async () => {
    const fetchFn = respond(message);

    await expect(sendMessage('walk-1', '¿Ya llegaste?', createHttpClient('http://api', fetchFn))).resolves.toEqual(
      message,
    );
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/walks/walk-1/messages',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ text: '¿Ya llegaste?' }) }),
    );
  });
});
