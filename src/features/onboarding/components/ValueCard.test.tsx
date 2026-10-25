import { render, screen } from '@testing-library/react-native';

import { ValueCard } from './ValueCard';

describe('ValueCard', () => {
  it('shows the pillar title and description with an icon badge', async () => {
    await render(
      <ValueCard index={0} pillar={{ title: 'Paseadores verificados', description: 'Revisamos su identidad.' }} />,
    );

    expect(screen.getByText('Paseadores verificados')).toBeOnTheScreen();
    expect(screen.getByText('Revisamos su identidad.')).toBeOnTheScreen();
  });
});
