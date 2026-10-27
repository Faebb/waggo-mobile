import { act, screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { ResetPasswordScreen } from './ResetPasswordScreen';

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

const CODE_LABEL = 'Código de recuperación';
const PASSWORD_LABEL = 'Contraseña nueva';
const REPEAT_LABEL = 'Repite la contraseña nueva';
const SUBMIT = 'Cambiar contraseña';

describe('ResetPasswordScreen (RF-001, RF-005)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  async function fillIn(user: ReturnType<typeof userEvent.setup>, code = '004821', password = 'Nueva1234') {
    await user.type(screen.getByLabelText(CODE_LABEL), code);
    await user.type(screen.getByLabelText(PASSWORD_LABEL), password);
    await user.type(screen.getByLabelText(REPEAT_LABEL), password);
  }

  it('sends the email, the code and the new password, then reports the change', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const onReset = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={onReset} />);

    expect(screen.getByText('ana@mail.com')).toBeOnTheScreen();
    await fillIn(user);
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    await waitFor(() => expect(onReset).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/reset-password$/);
    expect(JSON.parse(String(init.body))).toEqual({
      email: 'ana@mail.com',
      code: '004821',
      newPassword: 'Nueva1234',
    });
  });

  it('keeps only digits in the code and stops at six', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={jest.fn()} />);

    await user.type(screen.getByLabelText(CODE_LABEL), '12a4-5 678');

    expect(screen.getByLabelText(CODE_LABEL)).toHaveDisplayValue('124567');
  });

  it('disables the action until the code has 6 digits and the password is typed twice', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={jest.fn()} />);

    expect(screen.getByRole('button', { name: SUBMIT })).toBeDisabled();
    await user.type(screen.getByLabelText(CODE_LABEL), '004821');
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'Nueva1234');
    expect(screen.getByRole('button', { name: SUBMIT })).toBeDisabled();
    await user.type(screen.getByLabelText(REPEAT_LABEL), 'Nueva1234');
    expect(screen.getByRole('button', { name: SUBMIT })).toBeEnabled();
  });

  it('tells the person when the two passwords differ and does not call the API', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={jest.fn()} />);

    await user.type(screen.getByLabelText(CODE_LABEL), '004821');
    await user.type(screen.getByLabelText(PASSWORD_LABEL), 'Nueva1234');
    await user.type(screen.getByLabelText(REPEAT_LABEL), 'Otra12345');

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: SUBMIT })).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the message of the API when the code is invalid', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 404, [{ code: 'Identity.ResetCodeInvalid', message: 'El código no es válido.' }]),
      );
    const onReset = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={onReset} />);

    await fillIn(user, '111111');
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El código no es válido.');
    expect(onReset).not.toHaveBeenCalled();
  });

  it('shows the message of the API when the new password is weak', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      respondWith(null, 400, [
        {
          code: 'Identity.WeakPassword',
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
        },
      ]),
    );
    const user = userEvent.setup();
    await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={jest.fn()} />);

    await fillIn(user, '004821', 'debil');
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/al menos 8 caracteres/);
  });

  describe('asking for another code', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('makes the person wait 60 seconds, then asks for a new code', async () => {
      fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await renderWithProviders(<ResetPasswordScreen email="ana@mail.com" onReset={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Pedir otro código en 60 s' })).toBeDisabled();

      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
      await user.press(screen.getByRole('button', { name: 'Pedir otro código' }));

      expect(await screen.findByText('Te enviamos un código nuevo.')).toBeOnTheScreen();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toMatch(/\/api\/v1\/auth\/forgot-password$/);
      expect(JSON.parse(init.body as string)).toEqual({ email: 'ana@mail.com' });
      expect(screen.getByRole('button', { name: 'Pedir otro código en 60 s' })).toBeDisabled();
    });
  });
});
