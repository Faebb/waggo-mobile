import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { pendingWalkerProfile } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { AdminScreen } from './AdminScreen';

const QUEUE = '/api/v1/admin/walkers';

describe('AdminScreen (RF-002/RF-003 panel)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists the pending walkers with their details (example 2)', async () => {
    mockApi([{ path: QUEUE, data: [pendingWalkerProfile] }]);

    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByText('Andrés Gómez')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Verificación' })).toBeTruthy();
    expect(screen.getByText('PENDIENTES · 1')).toBeTruthy();
    expect(screen.getByText(/^Enviado hace /)).toBeTruthy();
    expect(screen.getByText('CC •••• 4050')).toBeTruthy();
    expect(screen.getByText('300 123 4567')).toBeTruthy();
    expect(screen.getByText('“3 años con perros grandes”')).toBeTruthy();
  });

  it('shows the loading state while the queue loads', async () => {
    mockApi([{ path: QUEUE, data: [pendingWalkerProfile] }]);

    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);

    expect(screen.getByLabelText('Cargando paseadores pendientes')).toBeTruthy();
    await screen.findByText('Andrés Gómez');
  });

  it('shows an empty state when there is nothing to review (example 3)', async () => {
    mockApi([{ path: QUEUE, data: [] }]);

    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByRole('header', { name: 'No hay paseadores por verificar.' })).toBeTruthy();
    expect(screen.getByText('Cuando alguien envíe su perfil, aparecerá aquí.')).toBeTruthy();
  });

  it('approves a walker, removes it from the queue and confirms it (example 4)', async () => {
    const approved = { ...pendingWalkerProfile, status: 'Approved' };
    mockApi([
      { path: QUEUE, data: [pendingWalkerProfile] },
      { method: 'POST', path: '/api/v1/admin/walkers/wp-1/approve', data: approved },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Aprobar' }));

    expect(await screen.findByText('Aprobaste a Andrés Gómez.')).toBeTruthy();
    expect(screen.queryByText('CC •••• 4050')).toBeNull();
  });

  it('shows the API message when approving fails', async () => {
    mockApi([
      { path: QUEUE, data: [pendingWalkerProfile] },
      {
        method: 'POST',
        path: '/api/v1/admin/walkers/wp-1/approve',
        status: 409,
        errors: [{ code: 'Walkers.NotPending', message: 'Este paseador ya fue revisado.' }],
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Aprobar' }));

    expect(await screen.findByText('Este paseador ya fue revisado.')).toBeTruthy();
  });

  it('rejects a walker with a reason from the sheet (example 5)', async () => {
    const rejected = { ...pendingWalkerProfile, status: 'Rejected', rejectionReason: 'Documento ilegible' };
    const fetchSpy = mockApi([
      { path: QUEUE, data: [pendingWalkerProfile] },
      { method: 'POST', path: '/api/v1/admin/walkers/wp-1/reject', data: rejected },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Rechazar' }));
    expect(screen.getByRole('header', { name: 'Rechazar a Andrés Gómez' })).toBeTruthy();
    await user.type(screen.getByLabelText('Motivo del rechazo (opcional)'), 'Documento ilegible');
    await user.press(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() => expect(screen.queryByText('CC •••• 4050')).toBeNull());
    const rejectCall = fetchSpy.mock.calls.find(([url]) => String(url).includes('/reject'));
    expect(JSON.parse(String(rejectCall?.[1]?.body))).toEqual({ reason: 'Documento ilegible' });
  });

  it('rejects a walker without a reason: it is optional (example 6)', async () => {
    const rejected = { ...pendingWalkerProfile, status: 'Rejected', rejectionReason: null };
    const fetchSpy = mockApi([
      { path: QUEUE, data: [pendingWalkerProfile] },
      { method: 'POST', path: '/api/v1/admin/walkers/wp-1/reject', data: rejected },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Rechazar' }));
    expect(screen.getByLabelText('Motivo del rechazo (opcional)')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirmar rechazo' })).toBeEnabled();
    await user.press(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() => expect(screen.queryByText('CC •••• 4050')).toBeNull());
    const rejectCall = fetchSpy.mock.calls.find(([url]) => String(url).includes('/reject'));
    expect(JSON.parse(String(rejectCall?.[1]?.body))).toEqual({ reason: '' });
  });

  it('closes the reject sheet with "Cancelar" without calling the API', async () => {
    const fetchSpy = mockApi([{ path: QUEUE, data: [pendingWalkerProfile] }]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);
    await screen.findByText('Andrés Gómez');

    await user.press(screen.getByRole('button', { name: 'Rechazar' }));
    await user.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Rechazar a Andrés Gómez')).toBeNull();
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('/reject'))).toBe(false);
  });

  it('shows an error with a retry when the queue fails to load (example 7)', async () => {
    mockApi([{ path: QUEUE, status: 500, errors: [{ code: 'Http.500', message: 'falló' }] }]);

    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar los paseadores pendientes.'),
    );
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeTruthy();
  });

  it('switches to the operation view, which is coming soon (slices 2–3)', async () => {
    mockApi([{ path: QUEUE, data: [] }]);
    const user = userEvent.setup();
    await renderWithProviders(<AdminScreen onOpenWalk={jest.fn()} />);

    await user.press(screen.getByRole('tab', { name: 'Operación' }));

    expect(screen.getByRole('header', { name: 'Operación' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Próximamente' })).toBeTruthy();
  });
});
