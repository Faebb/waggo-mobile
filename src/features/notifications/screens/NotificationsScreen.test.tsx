import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { acceptedNotification, emergencyNotification } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { NotificationsScreen } from './NotificationsScreen';

const inbox = { unreadCount: 2, items: [emergencyNotification, acceptedNotification] };

describe('NotificationsScreen (RF-014)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('lists the notices, the urgent ones marked, and marks them as read', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/notifications', data: inbox },
      { method: 'POST', path: '/api/v1/notifications/read', data: { ...inbox, unreadCount: 0 } },
    ]);

    await renderWithProviders(<NotificationsScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByText('Emergencia en el paseo')).toBeOnTheScreen();
    expect(screen.getByText('Tu paseo fue aceptado')).toBeOnTheScreen();
    expect(screen.getAllByText('URGENTE')).toHaveLength(1);
    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/v1\/notifications\/read$/),
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });

  it('opens the walk of a notice', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/notifications', data: inbox },
      { method: 'POST', path: '/api/v1/notifications/read', data: inbox },
    ]);
    const onOpenWalk = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<NotificationsScreen onOpenWalk={onOpenWalk} />);

    await user.press(await screen.findByRole('button', { name: /Tu paseo fue aceptado/ }));

    expect(onOpenWalk).toHaveBeenCalledWith('walk-1');
  });

  it('says so when there are no notices', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/notifications', data: { unreadCount: 0, items: [] } },
      { method: 'POST', path: '/api/v1/notifications/read', data: { unreadCount: 0, items: [] } },
    ]);

    await renderWithProviders(<NotificationsScreen onOpenWalk={jest.fn()} />);

    expect(await screen.findByText('No tienes avisos todavía.')).toBeOnTheScreen();
  });
});
