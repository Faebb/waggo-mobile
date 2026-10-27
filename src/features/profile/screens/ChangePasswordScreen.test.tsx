import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { setSession } from '@/shared/auth/session';
import { renderWithProviders } from '@/test/renderWithProviders';

import { ChangePasswordScreen } from './ChangePasswordScreen';

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

const CURRENT_LABEL = 'Contraseña actual';
const NEW_LABEL = 'Contraseña nueva';
const REPEAT_LABEL = 'Repite la contraseña nueva';
const SUBMIT = 'Cambiar contraseña';

describe('ChangePasswordScreen (RF-005)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => setSession({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 60_000 }));
  afterEach(() => {
    fetchSpy.mockRestore();
    setSession(null);
  });

  async function fillIn(user: ReturnType<typeof userEvent.setup>, current = 'Actual123', password = 'Nueva1234') {
    await user.type(screen.getByLabelText(CURRENT_LABEL), current);
    await user.type(screen.getByLabelText(NEW_LABEL), password);
    await user.type(screen.getByLabelText(REPEAT_LABEL), password);
  }

  it('sends both passwords with the refresh token of this session, then reports the change', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const onChanged = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ChangePasswordScreen onChanged={onChanged} />);

    await fillIn(user);
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/users\/me\/password$/);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({
      currentPassword: 'Actual123',
      newPassword: 'Nueva1234',
      refreshToken: 'rt',
    });
  });

  it('disables the action until the three fields are filled and the new password is typed twice', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ChangePasswordScreen onChanged={jest.fn()} />);

    expect(screen.getByRole('button', { name: SUBMIT })).toBeDisabled();
    await user.type(screen.getByLabelText(CURRENT_LABEL), 'Actual123');
    await user.type(screen.getByLabelText(NEW_LABEL), 'Nueva1234');
    expect(screen.getByRole('button', { name: SUBMIT })).toBeDisabled();
    await user.type(screen.getByLabelText(REPEAT_LABEL), 'Nueva1234');
    expect(screen.getByRole('button', { name: SUBMIT })).toBeEnabled();
  });

  it('tells the person when the two new passwords differ and does not call the API', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ChangePasswordScreen onChanged={jest.fn()} />);

    await user.type(screen.getByLabelText(CURRENT_LABEL), 'Actual123');
    await user.type(screen.getByLabelText(NEW_LABEL), 'Nueva1234');
    await user.type(screen.getByLabelText(REPEAT_LABEL), 'Otra12345');

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: SUBMIT })).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the message of the API when the current password is wrong', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 422, [
          { code: 'Identity.CurrentPasswordIncorrect', message: 'La contraseña actual no es correcta.' },
        ]),
      );
    const onChanged = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ChangePasswordScreen onChanged={onChanged} />);

    await fillIn(user, 'Equivocada1');
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La contraseña actual no es correcta.');
    expect(onChanged).not.toHaveBeenCalled();
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
    await renderWithProviders(<ChangePasswordScreen onChanged={jest.fn()} />);

    await fillIn(user, 'Actual123', 'debil');
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/al menos 8 caracteres/);
  });
});
