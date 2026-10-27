import { render, screen, userEvent } from '@testing-library/react-native';

import { Banner } from './Banner';

describe('Banner', () => {
  it('shows the title and message as an alert', async () => {
    await render(<Banner tone="danger" title="Algo falló" message="Intenta de nuevo." />);

    expect(screen.getByRole('alert')).toBeOnTheScreen();
    expect(screen.getByText('Algo falló')).toBeOnTheScreen();
    expect(screen.getByText('Intenta de nuevo.')).toBeOnTheScreen();
  });

  it('is a plain summary (not an alert) for info and success', async () => {
    await render(<Banner tone="info" message="Comparte tu ubicación." />);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Comparte tu ubicación.')).toBeOnTheScreen();
  });

  it('runs its action', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await render(<Banner tone="warning" message="Sin conexión." actionLabel="Reintentar" onAction={onAction} />);

    await user.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
