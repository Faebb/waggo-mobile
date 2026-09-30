import { render, screen } from '@testing-library/react-native';

import { ValueCard } from './ValueCard';

describe('ValueCard', () => {
  it('shows the pillar number, title and description', async () => {
    await render(
      <ValueCard index={0} pillar={{ title: 'Paseadores verificados', description: 'Revisamos su identidad.' }} />,
    );

    expect(screen.getByText('01')).toBeOnTheScreen();
    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Revisamos su identidad.')).toBeOnTheScreen();
  });
});
