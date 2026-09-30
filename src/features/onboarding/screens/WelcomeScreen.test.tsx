import { render, screen, userEvent } from '@testing-library/react-native';

import { WelcomeScreen } from './WelcomeScreen';

function renderWelcome(overrides: Partial<{ onQuotePress: () => void; onPetsPress: () => void }> = {}) {
  return render(<WelcomeScreen onQuotePress={jest.fn()} onPetsPress={jest.fn()} {...overrides} />);
}

describe('WelcomeScreen (UX-001)', () => {
  it('shows the brand, the headline and the three value pillars', async () => {
    await renderWelcome();

    expect(screen.getByText('Waggo')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Paseos seguros para tu perro' })).toBeOnTheScreen();
    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Paseo en vivo')).toBeOnTheScreen();
    expect(screen.getByText('Pagas al final')).toBeOnTheScreen();
    expect(screen.getByText('03')).toBeOnTheScreen();
  });

  it('opens the fare quote when the owner taps "Cotizar un paseo"', async () => {
    const onQuotePress = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onQuotePress });

    await user.press(screen.getByRole('button', { name: 'Cotizar un paseo' }));

    expect(onQuotePress).toHaveBeenCalledTimes(1);
  });

  it('opens the owner dogs when the owner taps "Mis perros" (RF-004)', async () => {
    const onPetsPress = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onPetsPress });

    await user.press(screen.getByRole('button', { name: 'Mis perros' }));

    expect(onPetsPress).toHaveBeenCalledTimes(1);
  });

  it('announces that sign-up is coming and offers no dead buttons', async () => {
    await renderWelcome();

    expect(screen.getByText('Muy pronto podrás crear tu cuenta como dueño o paseador.')).toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
