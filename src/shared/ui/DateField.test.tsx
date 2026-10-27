import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { DateField, formatDateText, formatIsoDate, parseDateText } from './DateField';

describe('parseDateText', () => {
  it.each([
    ['10/05/2021', '2021-05-10'],
    ['1/5/2021', '2021-05-01'],
    ['29/02/2024', '2024-02-29'],
  ])('reads %s as %s', (text, iso) => {
    expect(parseDateText(text)).toBe(iso);
  });

  it.each(['', '2021-05-10', '31/02/2021', '10/13/2021', '00/05/2021', '10/05/21', 'diez'])('rejects %p', (text) => {
    expect(parseDateText(text)).toBeNull();
  });
});

describe('formatDateText', () => {
  it.each([
    ['1', '1'],
    ['105', '10/5'],
    ['10052021', '10/05/2021'],
    ['10/05/2021x', '10/05/2021'],
  ])('formats %s as %s while typing', (typed, shown) => {
    expect(formatDateText(typed)).toBe(shown);
  });
});

describe('formatIsoDate', () => {
  it('shows a DateOnly as day/month/year', () => {
    expect(formatIsoDate('2021-05-10')).toBe('10/05/2021');
  });
});

function Harness() {
  const [value, setValue] = useState('');
  return <DateField label="Nacimiento" value={value} onChangeText={setValue} />;
}

describe('DateField', () => {
  it('adds the slashes as the user types the digits', async () => {
    const user = userEvent.setup();
    await render(<Harness />);

    await user.type(screen.getByLabelText('Nacimiento'), '10052021');

    expect(screen.getByLabelText('Nacimiento')).toHaveDisplayValue('10/05/2021');
  });

  it('shows the expected format as the hint', async () => {
    await render(<Harness />);

    expect(screen.getByText('Día/mes/año, por ejemplo 10/05/2021.')).toBeTruthy();
  });
});
