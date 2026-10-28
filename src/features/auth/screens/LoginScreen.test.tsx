import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { GoogleSignInButton } from '@/shared/auth/GoogleSignInButton';

import { renderWithProviders } from '@/test/renderWithProviders';

import { LoginScreen } from './LoginScreen';

jest.mock('@/shared/auth/GoogleSignInButton');

/** Stands in for the Google button: pressing it is "the person signed in with Google" and hands over the idToken. */
function googleButtonThatSignsInWith(idToken: string) {
  jest.mocked(GoogleSignInButton).mockImplementation(({ onIdToken }) => (
    <Pressable accessibilityRole="button" onPress={() => onIdToken(idToken)}>
      <Text>Continuar con Google</Text>
    </Pressable>
  ));
}

function respondWith(data: unknown, status = 200, errors: unknown[] = []) {
  return new Response(
    JSON.stringify({
      success: errors.length === 0,
      data,
      pagination: null,
      errors,
      warnings: [],
      infos: [],
      traceId: 't',
    }),
    { status },
  );
}

describe('LoginScreen (RF-005)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('sends credentials and opens the session right away', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respondWith({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <LoginScreen
        onLoggedIn={onLoggedIn}
        onGoToRegister={jest.fn()}
        onGoToForgotPassword={jest.fn()}
        onAccountNotConfirmed={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onLoggedIn).toHaveBeenCalledTimes(1));
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ email: 'ana@mail.com', password: 'Clave123!' });
  });

  it('shows a generic message when the credentials are wrong', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 400, [{ code: 'Identity.InvalidCredentials', message: 'Correo o contraseña incorrectos.' }]),
      );
    const user = userEvent.setup();
    await renderWithProviders(
      <LoginScreen
        onLoggedIn={jest.fn()}
        onGoToRegister={jest.fn()}
        onGoToForgotPassword={jest.fn()}
        onAccountNotConfirmed={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });

  it('goes to the register screen', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respondWith({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));
    const onGoToRegister = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <LoginScreen
        onLoggedIn={jest.fn()}
        onGoToRegister={onGoToRegister}
        onGoToForgotPassword={jest.fn()}
        onAccountNotConfirmed={jest.fn()}
      />,
    );

    await user.press(screen.getByRole('button', { name: '¿No tienes cuenta? Crear cuenta' }));

    expect(onGoToRegister).toHaveBeenCalledTimes(1);
  });

  it('offers to recover a forgotten password, carrying the email already typed', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(null));
    const onGoToForgotPassword = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <LoginScreen
        onLoggedIn={jest.fn()}
        onGoToRegister={jest.fn()}
        onGoToForgotPassword={onGoToForgotPassword}
        onAccountNotConfirmed={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.press(screen.getByText('¿Olvidaste tu contraseña?'));

    expect(onGoToForgotPassword).toHaveBeenCalledWith('ana@mail.com');
  });

  describe('an account that is not confirmed yet', () => {
    const notConfirmed = () =>
      respondWith(null, 422, [{ code: 'Identity.AccountNotConfirmed', message: 'Confirma tu correo para entrar.' }]);

    async function tryToLogIn(onAccountNotConfirmed: jest.Mock) {
      const user = userEvent.setup();
      await renderWithProviders(
        <LoginScreen
          onLoggedIn={jest.fn()}
          onGoToRegister={jest.fn()}
          onGoToForgotPassword={jest.fn()}
          onAccountNotConfirmed={onAccountNotConfirmed}
        />,
      );
      await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
      await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
      await user.press(screen.getByRole('button', { name: 'Entrar' }));
    }

    it('asks for a new code and sends the person to confirm with the email already typed', async () => {
      fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockImplementationOnce(() => Promise.resolve(notConfirmed()))
        .mockImplementation(() => Promise.resolve(respondWith(true)));
      const onAccountNotConfirmed = jest.fn();

      await tryToLogIn(onAccountNotConfirmed);

      await waitFor(() => expect(onAccountNotConfirmed).toHaveBeenCalledWith('ana@mail.com'));
      const [url, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
      expect(url).toMatch(/\/api\/v1\/auth\/resend-confirmation$/);
      expect(JSON.parse(String(init.body))).toEqual({ email: 'ana@mail.com' });
    });

    it('still sends the person to confirm when the new code cannot be requested', async () => {
      fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockImplementationOnce(() => Promise.resolve(notConfirmed()))
        .mockImplementation(() => Promise.reject(new Error('offline')));
      const onAccountNotConfirmed = jest.fn();

      await tryToLogIn(onAccountNotConfirmed);

      await waitFor(() => expect(onAccountNotConfirmed).toHaveBeenCalledWith('ana@mail.com'));
    });

    it('does not leave the login screen for any other error', async () => {
      fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockImplementation(() =>
          Promise.resolve(
            respondWith(null, 400, [
              { code: 'Identity.InvalidCredentials', message: 'Correo o contraseña incorrectos.' },
            ]),
          ),
        );
      const onAccountNotConfirmed = jest.fn();

      await tryToLogIn(onAccountNotConfirmed);

      expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
      expect(onAccountNotConfirmed).not.toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('signs in with Google: sends the idToken to the API and continues like a password login', async () => {
    googleButtonThatSignsInWith('google-id-token');
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respondWith({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen
        onLoggedIn={onLoggedIn}
        onGoToRegister={jest.fn()}
        onGoToForgotPassword={jest.fn()}
        onAccountNotConfirmed={jest.fn()}
      />,);

    await user.press(screen.getByRole('button', { name: 'Continuar con Google' }));

    await waitFor(() => expect(onLoggedIn).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/login\/google$/);
    expect(JSON.parse(String(init.body))).toEqual({ idToken: 'google-id-token' });
  });

  it('shows the message of the API when Google sign-in is refused', async () => {
    googleButtonThatSignsInWith('forged-token');
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      respondWith(null, 400, [
        { code: 'Identity.ExternalTokenInvalid', message: 'No pudimos validar tu cuenta de Google o Microsoft, intenta de nuevo.' },
      ]),
    );
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen
        onLoggedIn={onLoggedIn}
        onGoToRegister={jest.fn()}
        onGoToForgotPassword={jest.fn()}
        onAccountNotConfirmed={jest.fn()}
      />,);

    await user.press(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(await screen.findByText(/No pudimos validar tu cuenta de Google/)).toBeOnTheScreen();
    expect(onLoggedIn).not.toHaveBeenCalled();
  });

});
