import { exchangeCodeAsync, useAuthRequest } from 'expo-auth-session';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { env } from '@/shared/config/env';
import { renderWithProviders } from '@/test/renderWithProviders';

import { MicrosoftSignInButton as MicrosoftSignInButtonOnIos } from './MicrosoftSignInButton';

// The base module resolves to the native container in Jest: the web one is loaded by its full name.
const { MicrosoftSignInButton } = jest.requireActual<{ MicrosoftSignInButton: typeof MicrosoftSignInButtonOnIos }>(
  './MicrosoftSignInButton.web',
);
const mutableEnv = env as { microsoftClientId?: string };

jest.mock('expo-auth-session', () => ({
  ResponseType: { Code: 'code' },
  Prompt: { SelectAccount: 'select_account' },
  makeRedirectUri: jest.fn(() => 'https://app.mywaggo.com'),
  useAuthRequest: jest.fn(),
  exchangeCodeAsync: jest.fn(),
}));
jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn() }));
jest.mock('@/shared/config/env', () => ({ env: { microsoftClientId: 'ms-client-id' } }));

const promptAsync = jest.fn();
const request = { codeVerifier: 'verifier-123' };

describe('MicrosoftSignInButton on the web', () => {
  beforeEach(() => {
    mutableEnv.microsoftClientId = 'ms-client-id';
    jest.mocked(useAuthRequest).mockReturnValue([request, null, promptAsync] as never);
  });
  afterEach(() => jest.clearAllMocks());

  it('asks for the code with PKCE for the Microsoft "common" tenant and the openid, profile and email scopes', async () => {
    await renderWithProviders(<MicrosoftSignInButton onIdToken={jest.fn()} />);

    expect(useAuthRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'ms-client-id',
        scopes: ['openid', 'profile', 'email'],
        redirectUri: 'https://app.mywaggo.com',
        usePKCE: true,
        prompt: 'select_account',
      }),
      expect.objectContaining({
        authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      }),
    );
  });

  it('hands over the idToken after exchanging the code with the verifier', async () => {
    promptAsync.mockResolvedValue({ type: 'success', params: { code: 'the-code' } });
    jest.mocked(exchangeCodeAsync).mockResolvedValue({ idToken: 'microsoft-id-token' } as never);
    const onIdToken = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MicrosoftSignInButton onIdToken={onIdToken} />);

    await user.press(screen.getByRole('button', { name: 'Continuar con Microsoft' }));

    await waitFor(() => expect(onIdToken).toHaveBeenCalledWith('microsoft-id-token'));
    expect(exchangeCodeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'ms-client-id',
        code: 'the-code',
        redirectUri: 'https://app.mywaggo.com',
        extraParams: { code_verifier: 'verifier-123' },
      }),
      expect.objectContaining({ tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token' }),
    );
  });

  it('does nothing when the person closes the Microsoft window', async () => {
    promptAsync.mockResolvedValue({ type: 'dismiss' });
    const onIdToken = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MicrosoftSignInButton onIdToken={onIdToken} />);

    await user.press(screen.getByRole('button', { name: 'Continuar con Microsoft' }));

    await waitFor(() => expect(promptAsync).toHaveBeenCalled());
    expect(exchangeCodeAsync).not.toHaveBeenCalled();
    expect(onIdToken).not.toHaveBeenCalled();
  });

  it('does not hand over anything when the exchange fails or brings no idToken', async () => {
    promptAsync.mockResolvedValue({ type: 'success', params: { code: 'the-code' } });
    jest
      .mocked(exchangeCodeAsync)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({} as never);
    const onIdToken = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<MicrosoftSignInButton onIdToken={onIdToken} />);

    await user.press(screen.getByRole('button', { name: 'Continuar con Microsoft' }));
    await user.press(screen.getByRole('button', { name: 'Continuar con Microsoft' }));

    await waitFor(() => expect(exchangeCodeAsync).toHaveBeenCalledTimes(2));
    expect(onIdToken).not.toHaveBeenCalled();
  });

  it('shows nothing without EXPO_PUBLIC_MICROSOFT_CLIENT_ID', async () => {
    mutableEnv.microsoftClientId = undefined;

    const { toJSON } = await renderWithProviders(<MicrosoftSignInButton onIdToken={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });
});

describe('MicrosoftSignInButton on iOS and Android', () => {
  it('shows nothing yet: the native Microsoft sign-in comes with the development build (EAS)', async () => {
    const { toJSON } = await renderWithProviders(<MicrosoftSignInButtonOnIos onIdToken={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });
});
