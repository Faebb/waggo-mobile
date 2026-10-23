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

  it('sends credentials and reports the challenge id', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ challengeId: 'challenge-1' }));
    const onCodeSent = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen onCodeSent={onCodeSent} onGoToRegister={jest.fn()} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onCodeSent).toHaveBeenCalledWith('challenge-1', 'ana@mail.com'));
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
    await renderWithProviders(<LoginScreen onCodeSent={jest.fn()} onGoToRegister={jest.fn()} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });

  it('goes to the register screen', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ challengeId: 'challenge-1' }));
    const onGoToRegister = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen onCodeSent={jest.fn()} onGoToRegister={onGoToRegister} />);

    await user.press(screen.getByText('¿Nuevo en Waggo? Crea tu cuenta'));

    expect(onGoToRegister).toHaveBeenCalledTimes(1);
  });
});
