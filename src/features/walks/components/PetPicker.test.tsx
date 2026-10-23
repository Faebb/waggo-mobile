import { render, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { touch } from '@/shared/ui/theme';
import { luna, max } from '@/test/fixtures';

import { PetPicker } from './PetPicker';

describe('PetPicker', () => {
  it('toggles a dog and gives each chip at least the minimum touch height', async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    await render(<PetPicker label="¿Quién sale?" pets={[luna, max]} selected={['pet-max']} onToggle={onToggle} />);

    const chip = screen.getByRole('button', { name: 'Luna' });
    await user.press(chip);

    expect(onToggle).toHaveBeenCalledWith('pet-luna');
    expect(StyleSheet.flatten(chip.props.style).minHeight).toBe(touch.minHeight);
  });
});
