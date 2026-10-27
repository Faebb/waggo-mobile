import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('shows its title, message and content when visible', async () => {
    await render(
      <BottomSheet visible title="¿Cancelar el paseo?" message="Liberamos el pago retenido." onClose={jest.fn()}>
        <Text>Contenido</Text>
      </BottomSheet>,
    );

    expect(screen.getByRole('header', { name: '¿Cancelar el paseo?' })).toBeTruthy();
    expect(screen.getByText('Liberamos el pago retenido.')).toBeTruthy();
    expect(screen.getByText('Contenido')).toBeTruthy();
  });

  it('renders nothing while hidden', async () => {
    await render(<BottomSheet visible={false} title="¿Cancelar el paseo?" onClose={jest.fn()} />);

    expect(screen.queryByText('¿Cancelar el paseo?')).toBeNull();
  });

  it('closes when the scrim is pressed', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(<BottomSheet visible title="¿Cancelar el paseo?" onClose={onClose} />);

    await user.press(screen.getByRole('button', { name: 'Cerrar', includeHiddenElements: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on the system back gesture or the Escape key (onRequestClose)', async () => {
    const onClose = jest.fn();
    await render(<BottomSheet visible title="¿Cancelar el paseo?" onClose={onClose} />);

    fireEvent(screen.getByTestId('bottom-sheet'), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cannot be dismissed while an action is in progress', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(<BottomSheet visible dismissible={false} title="Enviando…" onClose={onClose} />);

    await user.press(screen.getByRole('button', { name: 'Cerrar', includeHiddenElements: true }));
    fireEvent(screen.getByTestId('bottom-sheet'), 'requestClose');

    expect(onClose).not.toHaveBeenCalled();
  });
});
