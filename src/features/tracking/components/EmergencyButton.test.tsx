import { Linking } from 'react-native';
import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { EmergencyButton } from './EmergencyButton';

type Status = 'idle' | 'pending' | 'error' | 'success';
type Element = ReturnType<typeof screen.getByText>;

function renderButton(
  props: Partial<{ status: Status; onConfirm: jest.Mock; onOpen: jest.Mock; onOpenChat: jest.Mock }>,
) {
  return render(<EmergencyButton viewer="Owner" status="idle" onConfirm={jest.fn()} {...props} />);
}

/** True when the element sits inside the modal part of the sheet (screen readers stay there, design 07 · 21). */
function isInsideModalSheet(element: Element): boolean {
  let node: Element | null = element;
  while (node !== null) {
    if (node.props.accessibilityViewIsModal === true) return true;
    node = node.parent;
  }
  return false;
}

describe('EmergencyButton (RF-012, design 07 · 21)', () => {
  it('opens a confirmation sheet before raising the emergency', async () => {
    const onConfirm = jest.fn();
    const onOpen = jest.fn();
    const user = userEvent.setup();
    await renderButton({ onConfirm, onOpen });

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));

    const title = screen.getByRole('header', { name: '¿Es una emergencia?' });
    expect(isInsideModalSheet(title)).toBe(true);
    expect(screen.getByText('Avisaremos de inmediato al paseador con tu ubicación actual.')).toBeOnTheScreen();
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it('tells the walker that the owner is the one warned', async () => {
    const user = userEvent.setup();
    await render(<EmergencyButton viewer="Walker" status="idle" onConfirm={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));

    expect(screen.getByText('Avisaremos de inmediato al dueño con tu ubicación actual.')).toBeOnTheScreen();
  });

  it('closes with "No, volver" without raising anything', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    await renderButton({ onConfirm });

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'No, volver' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('header', { name: '¿Es una emergencia?' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Emergencia' })).toBeOnTheScreen();
  });

  it('closes with the back button, the Escape key or the scrim', async () => {
    const user = userEvent.setup();
    await renderButton({});

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await fireEvent(screen.getByTestId('bottom-sheet'), 'requestClose');
    expect(screen.queryByRole('header', { name: '¿Es una emergencia?' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'Cerrar', includeHiddenElements: true }));
    expect(screen.queryByRole('header', { name: '¿Es una emergencia?' })).not.toBeOnTheScreen();
  });

  it('sends the kind of emergency and the message together', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    await renderButton({ onConfirm });

    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'Se soltó' }));
    await user.type(screen.getByLabelText('Mensaje (opcional)'), 'Cerca del parque');
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    expect(onConfirm).toHaveBeenCalledWith('Se soltó. Cerca del parque');
  });

  it('cannot be dismissed while the alert is being sent', async () => {
    const user = userEvent.setup();
    const { rerender } = await renderButton({});
    await user.press(screen.getByRole('button', { name: 'Emergencia' }));

    await rerender(<EmergencyButton viewer="Owner" status="pending" onConfirm={jest.fn()} />);
    await fireEvent(screen.getByTestId('bottom-sheet'), 'requestClose');

    expect(screen.getByRole('header', { name: '¿Es una emergencia?' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'No, volver' })).toBeDisabled();
  });

  it('asks to keep calm and offers to call 123 and write to the other person once sent', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const onOpenChat = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await renderButton({ onOpenChat });
    await user.press(screen.getByRole('button', { name: 'Emergencia' }));

    await rerender(<EmergencyButton viewer="Owner" status="success" onConfirm={jest.fn()} onOpenChat={onOpenChat} />);

    expect(screen.getByRole('header', { name: 'Mantén la calma' })).toBeOnTheScreen();
    expect(
      screen.getByText('Tu ubicación quedó registrada. Si alguien corre peligro, llama al 123.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Llamar al 123' }));
    expect(openURL).toHaveBeenCalledWith('tel:123');

    await user.press(screen.getByRole('button', { name: 'Escribir al paseador' }));
    expect(onOpenChat).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('header', { name: 'Mantén la calma' })).not.toBeOnTheScreen();
    openURL.mockRestore();
  });

  it('says how to call when the phone app cannot be opened', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no dialer'));
    const user = userEvent.setup();
    const { rerender } = await renderButton({});
    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await rerender(<EmergencyButton viewer="Owner" status="success" onConfirm={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Llamar al 123' }));

    expect(await screen.findByText('No pudimos abrir el teléfono. Marca 123 desde tu celular.')).toBeOnTheScreen();
    openURL.mockRestore();
  });

  it('keeps a retry with the same message and the 123 line when the alert could not be sent', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await renderButton({ onConfirm });
    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'Se lastimó' }));
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    await rerender(<EmergencyButton viewer="Owner" status="error" onConfirm={onConfirm} />);

    expect(screen.getByText('No pudimos enviar la alerta. Llama al 123 si es urgente.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Llamar al 123' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onConfirm).toHaveBeenLastCalledWith('Se lastimó');
  });

  it('still offers the retry on the screen after the sheet was closed', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await renderButton({ onConfirm });
    await user.press(screen.getByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'Se soltó' }));
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));
    await rerender(<EmergencyButton viewer="Owner" status="error" onConfirm={onConfirm} />);
    await user.press(screen.getByRole('button', { name: 'No, volver' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/No pudimos enviar la alerta\. Llama al 123 si es urgente\./);
    await user.press(screen.getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(onConfirm).toHaveBeenLastCalledWith('Se soltó'));
    expect(screen.getByRole('header', { name: '¿Es una emergencia?' })).toBeOnTheScreen();
  });
});
