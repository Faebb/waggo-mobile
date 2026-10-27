import { render, screen, userEvent } from '@testing-library/react-native';

import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('shows the message and retries', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await render(<ErrorState message="No pudimos cargar tus perros." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeOnTheScreen();
    expect(screen.getByText('No pudimos cargar tus perros.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Intentar de nuevo' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
