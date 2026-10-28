import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { GoogleSignInButton } from '@/shared/auth/GoogleSignInButton';
import { MicrosoftSignInButton } from '@/shared/auth/MicrosoftSignInButton';
import { renderWithProviders } from '@/test/renderWithProviders';

import { RegisterScreen } from './RegisterScreen';

jest.mock('@/shared/auth/GoogleSignInButton');
jest.mock('@/shared/auth/MicrosoftSignInButton');

/** Stands in for the Google button: pressing it is "the person signed in with Google" and hands over the idToken. */
function googleButtonThatSignsInWith(idToken: string) {
  jest.mocked(GoogleSignInButton).mockImplementation(({ onIdToken }) => (
    <Pressable accessibilityRole="button" onPress={() => onIdToken(idToken)}>
      <Text>Continuar con Google</Text>
    </Pressable>
  ));
}

/** Stands in for the Microsoft button: pressing it is "the person signed in with Microsoft" and hands over the idToken. */
function microsoftButtonThatSignsInWith(idToken: string) {
  jest.mocked(MicrosoftSignInButton).mockImplementation(({ onIdToken }) => (
    <Pressable accessibilityRole="button" onPress={() => onIdToken(idToken)}>
      <Text>Continuar con Microsoft</Text>
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

describe('RegisterScreen (RF-001)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('registers the account and reports the email', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    const onRegistered = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={onRegistered} onLoggedIn={jest.fn()} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(onRegistered).toHaveBeenCalledWith('ana@mail.com'));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/register$/);
    expect(JSON.parse(String(init.body))).toEqual({ email: 'ana@mail.com', password: 'Clave123!' });
  });

  it('shows the message of the API when the email is already registered', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 400, [{ code: 'Identity.EmailAlreadyRegistered', message: 'Ese correo ya tiene cuenta.' }]),
      );
    const onRegistered = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={onRegistered} onLoggedIn={jest.fn()} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese correo ya tiene cuenta.');
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('masks the password field', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={jest.fn()} />);

    expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  });

  it('checks the password rules live and announces each as met or pending', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={jest.fn()} />);

    await user.type(screen.getByLabelText('Contraseña'), 'Paseo2');

    expect(screen.getByLabelText('Al menos 8 caracteres: pendiente')).toBeOnTheScreen();
    expect(screen.getByLabelText('Una mayúscula: cumplida')).toBeOnTheScreen();
    expect(screen.getByLabelText('Un número: cumplida')).toBeOnTheScreen();
  });

  it('keeps "Crear cuenta" disabled until the password meets every rule', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={jest.fn()} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Paseo2');

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();

    await user.type(screen.getByLabelText('Contraseña'), '025');

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('signs in with Google: sends the idToken to the API and continues like a password login', async () => {
    googleButtonThatSignsInWith('google-id-token');
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respondWith({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={onLoggedIn} />);

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
        {
          code: 'Identity.ExternalTokenInvalid',
          message: 'No pudimos validar tu cuenta de Google o Microsoft, intenta de nuevo.',
        },
      ]),
    );
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={onLoggedIn} />);

    await user.press(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(await screen.findByText(/No pudimos validar tu cuenta de Google/)).toBeOnTheScreen();
    expect(onLoggedIn).not.toHaveBeenCalled();
  });

  it('signs in with Microsoft: sends the idToken to the API and continues like a password login', async () => {
    microsoftButtonThatSignsInWith('microsoft-id-token');
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respondWith({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={onLoggedIn} />);

    await user.press(screen.getByRole('button', { name: 'Continuar con Microsoft' }));

    await waitFor(() => expect(onLoggedIn).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/login\/microsoft$/);
    expect(JSON.parse(String(init.body))).toEqual({ idToken: 'microsoft-id-token' });
  });

  it('shows the message of the API when Microsoft sign-in is refused', async () => {
    microsoftButtonThatSignsInWith('forged-token');
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      respondWith(null, 400, [
        {
          code: 'Identity.ExternalTokenInvalid',
          message: 'No pudimos validar tu cuenta de Google o Microsoft, intenta de nuevo.',
        },
      ]),
    );
    const onLoggedIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} onLoggedIn={onLoggedIn} />);

    await user.press(screen.getByRole('button', { name: 'Continuar con Microsoft' }));

    expect(await screen.findByText(/No pudimos validar tu cuenta de Google o Microsoft/)).toBeOnTheScreen();
    expect(onLoggedIn).not.toHaveBeenCalled();
  });
});
