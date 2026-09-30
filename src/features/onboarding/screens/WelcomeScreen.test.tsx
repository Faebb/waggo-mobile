import { render, screen, userEvent } from '@testing-library/react-native';

import { WelcomeScreen } from './WelcomeScreen';

function renderWelcome(props: Partial<{ onStartAsOwner: () => void; onStartAsWalker: () => void }> = {}) {
  return render(<WelcomeScreen onStartAsOwner={jest.fn()} onStartAsWalker={jest.fn()} {...props} />);
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

  it('enters as an owner (RF-007)', async () => {
    const onStartAsOwner = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onStartAsOwner });

    await user.press(screen.getByRole('button', { name: 'Quiero pasear a mi perro' }));

    expect(onStartAsOwner).toHaveBeenCalledTimes(1);
  });

  it('enters as a walker, like the driver side of a ride app (RF-007)', async () => {
    const onStartAsWalker = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onStartAsWalker });

    await user.press(screen.getByRole('button', { name: 'Soy paseador' }));

    expect(onStartAsWalker).toHaveBeenCalledTimes(1);
  });

  it('announces that sign-up is coming', async () => {
    await renderWelcome();

    expect(screen.getByText('Muy pronto podrás crear tu cuenta como dueño o paseador.')).toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
