import { render, screen } from '@testing-library/react-native';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders as a decorative placeholder, exposing no role or text to assistive tech', async () => {
    await render(<Skeleton width={120} height={16} />);

    expect(screen.toJSON()).not.toBeNull();
    expect(screen.queryByRole('text')).toBeNull();
    expect(screen.queryByRole('image')).toBeNull();
  });
});
