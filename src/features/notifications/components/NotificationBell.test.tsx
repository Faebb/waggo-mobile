import { screen, userEvent } from '@testing-library/react-native';

import { acceptedNotification, emergencyNotification } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { NotificationBell } from './NotificationBell';

describe('NotificationBell (RF-014)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows how many notices are unread and opens the inbox', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/notifications', data: { unreadCount: 2, items: [emergencyNotification, acceptedNotification] } },
    ]);
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<NotificationBell onPress={onPress} />);

    await user.press(await screen.findByRole('button', { name: 'Avisos, 2 sin leer' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows no number when everything is read', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/notifications', data: { unreadCount: 0, items: [] } }]);

    await renderWithProviders(<NotificationBell onPress={jest.fn()} />);

    expect(await screen.findByRole('button', { name: 'Avisos' })).toBeOnTheScreen();
  });
});
