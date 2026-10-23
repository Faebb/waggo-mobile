import { render, screen } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';

import { touch } from '@/shared/ui/theme';
import { luna } from '@/test/fixtures';

import { PetRow } from './PetRow';

describe('PetRow', () => {
  it('shows the dog and keeps a row at least as tall as the minimum touch area', async () => {
    await render(<PetRow pet={{ ...luna, size: 'Medium' }} />);

    expect(screen.getByText('Luna')).toBeOnTheScreen();
    const row = screen.toJSON() as unknown as { props: { style: ViewStyle } };
    expect(StyleSheet.flatten(row.props.style).minHeight).toBe(touch.minHeight);
  });
});
