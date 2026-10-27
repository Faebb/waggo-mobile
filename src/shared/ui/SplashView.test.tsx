import { render, screen } from '@testing-library/react-native';

import { SplashView } from './SplashView';

describe('SplashView (design proposal 08)', () => {
  it('shows the logo while the app loads', async () => {
    await render(<SplashView />);

    expect(screen.getByLabelText('Cargando Waggo')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Waggo' })).toBeOnTheScreen();
  });
});
