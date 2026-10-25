import { createHttpClient } from '@/shared/api/httpClient';
import { pendingWalkerProfile } from '@/test/fixtures';

import { approveWalker, listPendingWalkers, rejectWalker } from './adminWalkersApi';

const envelope = (data: unknown) => ({
  success: true,
  data,
  pagination: null,
  errors: [],
  warnings: [],
  infos: [],
  traceId: 't',
});

const respond = (body: unknown) => jest.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

describe('adminWalkersApi (RF-002/RF-003)', () => {
  it('lists pending walkers from GET /api/v1/admin/walkers?status=Pending', async () => {
    const fetchFn = respond(envelope([pendingWalkerProfile]));

    const profiles = await listPendingWalkers(createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/admin/walkers?status=Pending',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(profiles).toEqual([pendingWalkerProfile]);
  });

  it('approves a walker with POST /api/v1/admin/walkers/{id}/approve', async () => {
    const approved = { ...pendingWalkerProfile, status: 'Approved' };
    const fetchFn = respond(envelope(approved));

    const profile = await approveWalker('wp-1', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/admin/walkers/wp-1/approve',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(profile).toEqual(approved);
  });

  it('rejects a walker with the reason in POST /api/v1/admin/walkers/{id}/reject', async () => {
    const rejected = { ...pendingWalkerProfile, status: 'Rejected', rejectionReason: 'Documento ilegible' };
    const fetchFn = respond(envelope(rejected));

    const profile = await rejectWalker('wp-1', 'Documento ilegible', createHttpClient('http://api', fetchFn));

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/api/v1/admin/walkers/wp-1/reject',
      expect.objectContaining({ body: JSON.stringify({ reason: 'Documento ilegible' }) }),
    );
    expect(profile).toEqual(rejected);
  });
});
