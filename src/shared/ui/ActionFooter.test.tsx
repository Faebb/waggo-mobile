import { render, screen } from '@testing-library/react-native';

import { ActionFooter } from './ActionFooter';
import { Button } from './Button';

describe('ActionFooter', () => {
  it('renders its children and the main action', async () => {
    await render(
      <ActionFooter>
        <Button label="Guardar perro" onPress={() => undefined} />
      </ActionFooter>,
    );

    expect(screen.getByRole('button', { name: 'Guardar perro' })).toBeOnTheScreen();
  });
});
