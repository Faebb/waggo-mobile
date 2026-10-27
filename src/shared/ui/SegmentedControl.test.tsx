import { render, screen, userEvent } from '@testing-library/react-native';

import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'walkers', label: 'Paseadores' },
  { value: 'operation', label: 'Operación' },
] as const;

describe('SegmentedControl', () => {
  it('marks the current option as the selected tab', async () => {
    await render(<SegmentedControl label="Sección" options={OPTIONS} value="walkers" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Paseadores' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Operación' })).not.toBeSelected();
  });

  it('reports the option the user picks', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<SegmentedControl label="Sección" options={OPTIONS} value="walkers" onChange={onChange} />);

    await user.press(screen.getByRole('tab', { name: 'Operación' }));

    expect(onChange).toHaveBeenCalledWith('operation');
  });
});
