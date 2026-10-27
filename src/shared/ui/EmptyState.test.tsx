import { render, screen, userEvent } from '@testing-library/react-native';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('shows the title, the message and its action', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await render(
      <EmptyState
        title="Aún no tienes perros"
        message="Agrega a tu perro para pedir un paseo."
        actionLabel="Agregar mi primer perro"
        onAction={onAction}
      />,
    );

    expect(screen.getByRole('header', { name: 'Aún no tienes perros' })).toBeOnTheScreen();
    expect(screen.getByText('Agrega a tu perro para pedir un paseo.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Agregar mi primer perro' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('works without an action', async () => {
    await render(<EmptyState title="No tienes avisos" />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
