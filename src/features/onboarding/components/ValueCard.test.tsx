import { render, screen } from '@testing-library/react-native';

import { ValueCard } from './ValueCard';

describe('ValueCard', () => {
  it('shows the pillar title and description', async () => {
    await render(
      <ValueCard pillar={{ icon: '🛡️', title: 'Paseadores verificados', description: 'Revisamos su identidad.' }} />,
    );

    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Revisamos su identidad.')).toBeOnTheScreen();
  });
});
