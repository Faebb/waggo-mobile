import { Platform, Text } from 'react-native';
import { screen } from '@testing-library/react-native';

import { env } from '@/shared/config/env';
import { renderWithProviders } from '@/test/renderWithProviders';

import { GoogleSignInButton } from './GoogleSignInButton';
import { MicrosoftSignInButton } from './MicrosoftSignInButton';
import { SocialSignIn } from './SocialSignIn';

const mutableEnv = env as { googleWebClientId?: string; microsoftClientId?: string };

jest.mock('./GoogleSignInButton');
jest.mock('./MicrosoftSignInButton');
jest.mock('@/shared/config/env', () => ({ env: {} }));

describe('SocialSignIn', () => {
  const originalOs = Platform.OS;

  beforeEach(() => {
    jest.mocked(GoogleSignInButton).mockImplementation(() => <Text>Google</Text>);
    jest.mocked(MicrosoftSignInButton).mockImplementation(() => <Text>Microsoft</Text>);
  });
  afterEach(() => {
    Platform.OS = originalOs;
    mutableEnv.googleWebClientId = undefined;
    mutableEnv.microsoftClientId = undefined;
  });

  it('draws one "o" divider and both buttons on the web when a provider is configured', async () => {
    Platform.OS = 'web';
    mutableEnv.microsoftClientId = 'ms';

    await renderWithProviders(<SocialSignIn onGoogleIdToken={jest.fn()} onMicrosoftIdToken={jest.fn()} />);

    expect(screen.getAllByText('o')).toHaveLength(1);
    expect(screen.getByText('Google')).toBeOnTheScreen();
    expect(screen.getByText('Microsoft')).toBeOnTheScreen();
  });

  it('draws no divider when no provider is configured, or outside the web', async () => {
    Platform.OS = 'web';
    const { rerender } = await renderWithProviders(
      <SocialSignIn onGoogleIdToken={jest.fn()} onMicrosoftIdToken={jest.fn()} />,
    );
    expect(screen.queryByText('o')).toBeNull();

    Platform.OS = 'ios';
    mutableEnv.googleWebClientId = 'g';
    rerender(<SocialSignIn onGoogleIdToken={jest.fn()} onMicrosoftIdToken={jest.fn()} />);
    expect(screen.queryByText('o')).toBeNull();
  });
});
