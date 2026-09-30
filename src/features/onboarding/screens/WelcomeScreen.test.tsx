import { render, screen, userEvent } from '@testing-library/react-native';

import { WelcomeScreen } from './WelcomeScreen';

describe('WelcomeScreen (UX-001)', () => {
  it('shows the brand, the headline and the three value pillars', async () => {
    await render(<WelcomeScreen onQuotePress={jest.fn()} />);

    expect(screen.getByText('Waggo')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Paseos seguros para tu perro' })).toBeOnTheScreen();
    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Paseo en vivo')).toBeOnTheScreen();
    expect(screen.getByText('Pagas al final')).toBeOnTheScreen();
  });

  it('opens the fare quote when the owner taps "Cotizar un paseo"', async () => {
    const onQuotePress = jest.fn();
    const user = userEvent.setup();
    await render(<WelcomeScreen onQuotePress={onQuotePress} />);

    await user.press(screen.getByRole('button', { name: 'Cotizar un paseo' }));

    expect(onQuotePress).toHaveBeenCalledTimes(1);
  });

  it('announces that sign-up is coming and offers no dead buttons', async () => {
    await render(<WelcomeScreen onQuotePress={jest.fn()} />);

    expect(screen.getByText('Muy pronto podrás crear tu cuenta como dueño o paseador.')).toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
