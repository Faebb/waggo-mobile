import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { AdminLink } from './AdminLink';

describe('AdminLink', () => {
  it('opens the admin panel on press', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<AdminLink onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Panel de administración' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
