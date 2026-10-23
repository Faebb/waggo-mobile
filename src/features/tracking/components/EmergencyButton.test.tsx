import { render, screen, userEvent } from '@testing-library/react-native';

import { EmergencyButton } from './EmergencyButton';

describe('EmergencyButton (RF-012)', () => {
  it('asks for confirmation before raising the emergency', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    await render(<EmergencyButton onConfirm={onConfirm} sending={false} />);

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    expect(onConfirm).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    await render(<EmergencyButton onConfirm={onConfirm} sending={false} />);

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'No, volver' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Emergencia' })).toBeOnTheScreen();
  });

  it('sends the optional message typed in the confirmation step, limited to 500 characters', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    await render(<EmergencyButton onConfirm={onConfirm} sending={false} />);

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    const field = screen.getByLabelText('Mensaje');
    expect(field.props.maxLength).toBe(500);
    await user.type(field, '  Luna se soltó  ');
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    expect(onConfirm).toHaveBeenCalledWith('Luna se soltó');
  });

  it('sends no message when the field is left empty', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    await render(<EmergencyButton onConfirm={onConfirm} sending={false} />);

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });
});
