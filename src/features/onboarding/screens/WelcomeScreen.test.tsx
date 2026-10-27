import { render, screen, userEvent } from '@testing-library/react-native';

import { WelcomeScreen } from './WelcomeScreen';

type Handlers = { onStartAsOwner: () => void; onStartAsWalker: () => void; onLogin: () => void };

function renderWelcome(props: Partial<Handlers> = {}) {
  return render(
    <WelcomeScreen onStartAsOwner={jest.fn()} onStartAsWalker={jest.fn()} onLogin={jest.fn()} {...props} />,
  );
}

describe('WelcomeScreen (UX-001)', () => {
  it('shows the logo, the headline and the three value pillars', async () => {
    await renderWelcome();

    expect(screen.getByRole('image', { name: 'Waggo' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Paseos seguros para tu perro' })).toBeOnTheScreen();
    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Paseo en vivo')).toBeOnTheScreen();
    expect(screen.getByText('Pagas al final')).toBeOnTheScreen();
  });

  it('enters as an owner (RF-007)', async () => {
    const onStartAsOwner = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onStartAsOwner });

    await user.press(screen.getByRole('button', { name: 'Pedir un paseo' }));

    expect(onStartAsOwner).toHaveBeenCalledTimes(1);
  });

  it('enters as a walker, like the driver side of a ride app (RF-007)', async () => {
    const onStartAsWalker = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onStartAsWalker });

    await user.press(screen.getByRole('button', { name: 'Quiero ser paseador' }));

    expect(onStartAsWalker).toHaveBeenCalledTimes(1);
  });

  it('lets someone with an account go straight to sign in (RF-005)', async () => {
    const onLogin = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onLogin });

    await user.press(screen.getByRole('button', { name: 'Ya tengo cuenta · Iniciar sesión' }));

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('offers exactly the owner, walker and sign-in entry points', async () => {
    await renderWelcome();

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
