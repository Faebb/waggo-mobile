import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { LoginScreen } from './LoginScreen';

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
      <LoginScreen onLoggedIn={onLoggedIn} onGoToRegister={jest.fn()} onGoToForgotPassword={jest.fn()} />,
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
      <LoginScreen onLoggedIn={jest.fn()} onGoToRegister={jest.fn()} onGoToForgotPassword={jest.fn()} />,
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
      <LoginScreen onLoggedIn={jest.fn()} onGoToRegister={onGoToRegister} onGoToForgotPassword={jest.fn()} />,
    );

    await user.press(screen.getByText('¿Nuevo en Waggo? Crea tu cuenta'));

    expect(onGoToRegister).toHaveBeenCalledTimes(1);
  });

  it('offers to recover a forgotten password, carrying the email already typed', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(null));
    const onGoToForgotPassword = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <LoginScreen onLoggedIn={jest.fn()} onGoToRegister={jest.fn()} onGoToForgotPassword={onGoToForgotPassword} />,
    );

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.press(screen.getByText('¿Olvidaste tu contraseña?'));

    expect(onGoToForgotPassword).toHaveBeenCalledWith('ana@mail.com');
  });
});
