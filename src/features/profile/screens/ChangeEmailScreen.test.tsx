import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { setSession } from '@/shared/auth/session';
import { renderWithProviders } from '@/test/renderWithProviders';

import { ChangeEmailScreen } from './ChangeEmailScreen';

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

const NEW_EMAIL_LABEL = 'Correo nuevo';
const PASSWORD_LABEL = 'Contraseña';
const CODE_LABEL = 'Código de confirmación';

describe('ChangeEmailScreen (RF-005)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 }));
  afterEach(() => {
    fetchSpy.mockRestore();
    setSession(null);
  });

  async function askForTheCode(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(NEW_EMAIL_LABEL), 'ana.nueva@mail.com');
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'Clave123!');
    await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  }

  it('asks for the code with the new email and the password, then waits for the code', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={jest.fn()} />);

    await askForTheCode(user);

    expect(await screen.findByLabelText(CODE_LABEL)).toBeOnTheScreen();
    expect(screen.getByText('ana.nueva@mail.com')).toBeOnTheScreen();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/users\/me\/email$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ newEmail: 'ana.nueva@mail.com', password: 'Clave123!' });
  });

  it('keeps the action disabled until the new email and the password are typed', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeDisabled();
    await user.type(screen.getByLabelText(NEW_EMAIL_LABEL), 'ana.nueva@mail.com');
    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeDisabled();
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'Clave123!');
    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeEnabled();
  });

  it('shows the message of the API when the password is wrong and stays on the first step', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 422, [
          { code: 'Identity.CurrentPasswordIncorrect', message: 'La contraseña actual no es correcta.' },
        ]),
      );
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={jest.fn()} />);

    await askForTheCode(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('La contraseña actual no es correcta.');
    expect(screen.queryByLabelText(CODE_LABEL)).not.toBeOnTheScreen();
  });

  it('shows the message of the API when the email already has an account', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 422, [
          { code: 'Identity.EmailAlreadyRegistered', message: 'Ese correo ya tiene una cuenta.' },
        ]),
      );
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={jest.fn()} />);

    await askForTheCode(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese correo ya tiene una cuenta.');
  });

  it('confirms the change with the 6-digit code and this session refresh token, then reports it', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const onChanged = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={onChanged} />);
    await askForTheCode(user);

    await user.type(await screen.findByLabelText(CODE_LABEL), '004821');
    await user.press(screen.getByRole('button', { name: 'Confirmar correo' }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/users\/me\/email\/confirm$/);
    expect(JSON.parse(String(init.body))).toEqual({ code: '004821', refreshToken: 'rt' });
  });

  it('keeps only digits in the code, stops at six and disables the action until it is complete', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={jest.fn()} />);
    await askForTheCode(user);

    await user.type(await screen.findByLabelText(CODE_LABEL), '12a4-5');

    expect(screen.getByLabelText(CODE_LABEL)).toHaveDisplayValue('1245');
    expect(screen.getByRole('button', { name: 'Confirmar correo' })).toBeDisabled();
  });

  it('shows the message of the API when the code is wrong', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respondWith(true))
      .mockResolvedValueOnce(
        respondWith(null, 404, [{ code: 'Identity.EmailChangeCodeInvalid', message: 'El código no es válido.' }]),
      );
    const onChanged = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={onChanged} />);
    await askForTheCode(user);

    await user.type(await screen.findByLabelText(CODE_LABEL), '111111');
    await user.press(screen.getByRole('button', { name: 'Confirmar correo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El código no es válido.');
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('lets the person go back and use another email', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ChangeEmailScreen onChanged={jest.fn()} />);
    await askForTheCode(user);

    await user.press(await screen.findByRole('button', { name: 'Usar otro correo' }));

    expect(screen.getByLabelText(NEW_EMAIL_LABEL)).toBeOnTheScreen();
    expect(screen.queryByLabelText(CODE_LABEL)).not.toBeOnTheScreen();
  });
});
