import { render, screen, userEvent } from '@testing-library/react-native';

import { TextField } from './TextField';

describe('TextField', () => {
  it('is found by its label and reports what the user types', async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    await render(<TextField label="Nombre" value="" onChangeText={onChangeText} />);

    await user.type(screen.getByLabelText('Nombre'), 'Luna');

    expect(onChangeText).toHaveBeenLastCalledWith('Luna');
  });

  it('shows the error below the field', async () => {
    await render(<TextField label="Peso" value="120" onChangeText={jest.fn()} error="El peso no es válido." />);

    expect(screen.getByText('El peso no es válido.')).toBeOnTheScreen();
  });

  it('shows the hint when there is no error', async () => {
    await render(<TextField label="Raza" value="" onChangeText={jest.fn()} hint="Opcional" />);

    expect(screen.getByText('Opcional')).toBeOnTheScreen();
  });
});
