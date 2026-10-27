import { render, screen } from '@testing-library/react-native';

import { AuthBarLogo, AuthHeader } from './AuthHeader';

describe('AuthHeader', () => {
  it('shows the title as a header and the lead below it, without repeating the logo', async () => {
    await render(<AuthHeader title="Inicia sesión" subtitle="Sigue el paseo de tu perro en vivo." />);

    expect(screen.getByRole('header', { name: 'Inicia sesión' })).toBeOnTheScreen();
    expect(screen.getByText('Sigue el paseo de tu perro en vivo.')).toBeOnTheScreen();
    expect(screen.queryByRole('image', { name: 'Waggo' })).not.toBeOnTheScreen();
  });
});

describe('AuthBarLogo', () => {
  it('is the corgi head labeled "Waggo" for the navigation bar', async () => {
    await render(<AuthBarLogo />);

    expect(screen.getByRole('image', { name: 'Waggo' })).toBeOnTheScreen();
  });
});
