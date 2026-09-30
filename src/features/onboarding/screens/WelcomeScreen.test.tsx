import { render, screen, userEvent } from '@testing-library/react-native';

import { WelcomeScreen } from './WelcomeScreen';

describe('WelcomeScreen (UX-001)', () => {
  it('shows the brand, the headline and the three value pillars', async () => {
    await render(<WelcomeScreen onStart={jest.fn()} />);

    expect(screen.getByText('Waggo')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Paseos seguros para tu perro' })).toBeOnTheScreen();
    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Paseo en vivo')).toBeOnTheScreen();
    expect(screen.getByText('Pagas al final')).toBeOnTheScreen();
    expect(screen.getByText('03')).toBeOnTheScreen();
  });

  it('enters the app when the owner taps "Empezar" (RF-007)', async () => {
    const onStart = jest.fn();
    const user = userEvent.setup();
    await render(<WelcomeScreen onStart={onStart} />);

    await user.press(screen.getByRole('button', { name: 'Empezar' }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('announces that sign-up is coming and offers a single way in', async () => {
    await render(<WelcomeScreen onStart={jest.fn()} />);

    expect(screen.getByText('Muy pronto podrás crear tu cuenta como dueño o paseador.')).toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
