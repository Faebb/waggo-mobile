import { renderWithProviders } from '@/test/renderWithProviders';

import { GoogleSignInButton } from './GoogleSignInButton';

describe('GoogleSignInButton on iOS and Android', () => {
  it('shows nothing yet: the native Google sign-in needs the development build (EAS)', async () => {
    const { toJSON } = await renderWithProviders(<GoogleSignInButton onIdToken={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });
});
