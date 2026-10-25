import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { pendingWalkerProfile } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { AdminWalkersScreen } from './AdminWalkersScreen';

describe('AdminWalkersScreen (RF-002/RF-003)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists the pending walkers with their details', async () => {
    mockApi([{ path: '/api/v1/admin/walkers', data: [pendingWalkerProfile] }]);

    await renderWithProviders(<AdminWalkersScreen />);

    expect(await screen.findByText('Andrés Gómez')).toBeTruthy();
    expect(screen.getByText('CC ···· 4050')).toBeTruthy();
  });

  it('shows an empty state when there is nothing to review', async () => {
    mockApi([{ path: '/api/v1/admin/walkers', data: [] }]);

    await renderWithProviders(<AdminWalkersScreen />);

    expect(await screen.findByText('No hay paseadores por verificar.')).toBeTruthy();
  });

  it('approves a walker and removes it from the queue', async () => {
    const approved = { ...pendingWalkerProfile, status: 'Approved' };
    mockApi([
      { path: '/api/v1/admin/walkers', data: [pendingWalkerProfile] },
      { method: 'POST', path: '/api/v1/admin/walkers/wp-1/approve', data: approved },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminWalkersScreen />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(screen.queryByText('Andrés Gómez')).toBeNull());
  });

  it('rejects a walker with a reason and removes it from the queue', async () => {
    const rejected = { ...pendingWalkerProfile, status: 'Rejected', rejectionReason: 'Documento ilegible' };
    const fetchSpy = mockApi([
      { path: '/api/v1/admin/walkers', data: [pendingWalkerProfile] },
      { method: 'POST', path: '/api/v1/admin/walkers/wp-1/reject', data: rejected },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminWalkersScreen />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Rechazar' }));
    await user.type(screen.getByLabelText('Motivo del rechazo'), 'Documento ilegible');
    await user.press(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() => expect(screen.queryByText('Andrés Gómez')).toBeNull());
    const rejectCall = fetchSpy.mock.calls.find(([url]) => String(url).includes('/reject'));
    expect(JSON.parse(String(rejectCall?.[1]?.body))).toEqual({ reason: 'Documento ilegible' });
  });

  it('shows an error message when the queue fails to load', async () => {
    mockApi([{ path: '/api/v1/admin/walkers', status: 500, errors: [{ code: 'Http.500', message: 'falló' }] }]);

    await renderWithProviders(<AdminWalkersScreen />);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar los paseadores pendientes.'),
    );
  });
});
