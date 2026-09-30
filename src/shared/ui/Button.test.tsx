import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('runs the action when pressed (primary)', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Continuar" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('runs the action when pressed (secondary)', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Volver" variant="secondary" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Volver' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('runs the action when pressed (danger, for emergencies)', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Emergencia" variant="danger" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses and exposes the disabled state when disabled', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Continuar" disabled onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });
});
