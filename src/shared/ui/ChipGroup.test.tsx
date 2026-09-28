import { render, screen, userEvent } from '@testing-library/react-native';

import { ChipGroup } from './ChipGroup';

const options = [
  { value: 'a', label: 'Opción A' },
  { value: 'b', label: 'Opción B' },
];

describe('ChipGroup', () => {
  it('marks the selected option', async () => {
    await render(<ChipGroup label="Tipo" options={options} value="b" onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Opción B' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Opción A' })).not.toBeSelected();
  });

  it('notifies the pressed option', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<ChipGroup label="Tipo" options={options} value="a" onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Opción B' }));

    expect(onChange).toHaveBeenCalledWith('b');
  });
});
