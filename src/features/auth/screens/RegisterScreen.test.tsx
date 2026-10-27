import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { RegisterScreen } from './RegisterScreen';

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
    await renderWithProviders(<RegisterScreen onRegistered={onRegistered} />);

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
    await renderWithProviders(<RegisterScreen onRegistered={onRegistered} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave123!');
    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese correo ya tiene cuenta.');
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('masks the password field', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} />);

    expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  });

  it('checks the password rules live and announces each as met or pending', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} />);

    await user.type(screen.getByLabelText('Contraseña'), 'Paseo2');

    expect(screen.getByLabelText('Al menos 8 caracteres: pendiente')).toBeOnTheScreen();
    expect(screen.getByLabelText('Una mayúscula: cumplida')).toBeOnTheScreen();
    expect(screen.getByLabelText('Un número: cumplida')).toBeOnTheScreen();
  });

  it('keeps "Crear cuenta" disabled until the password meets every rule', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith({ id: 'u1', email: 'ana@mail.com' }));
    const user = userEvent.setup();
    await renderWithProviders(<RegisterScreen onRegistered={jest.fn()} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Paseo2');

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();

    await user.type(screen.getByLabelText('Contraseña'), '025');

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });
});
