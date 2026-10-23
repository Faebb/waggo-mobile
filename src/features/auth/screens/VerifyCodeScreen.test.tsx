import { act, screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';
import { getSession, setSession } from '@/shared/auth/session';

import { VerifyCodeScreen } from './VerifyCodeScreen';

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

describe('VerifyCodeScreen (RF-005)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => {
    fetchSpy.mockRestore();
    setSession(null);
  });

  it('verifies the code, opens the session and reports success', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respondWith({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 900 }));
    const onVerified = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<VerifyCodeScreen challengeId="challenge-1" onVerified={onVerified} />);

    await user.type(screen.getByLabelText('Código'), '048213');
    await user.press(screen.getByRole('button', { name: 'Verificar' }));

    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1));
    expect(getSession()).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ challengeId: 'challenge-1', code: '048213' });
  });

  it('shows the message of the API when the code is wrong', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 400, [{ code: 'Identity.InvalidCode', message: 'El código no es correcto.' }]),
      );
    const onVerified = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<VerifyCodeScreen challengeId="challenge-1" onVerified={onVerified} />);

    await user.type(screen.getByLabelText('Código'), '000000');
    await user.press(screen.getByRole('button', { name: 'Verificar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El código no es correcto.');
    expect(onVerified).not.toHaveBeenCalled();
    expect(getSession()).toBeNull();
  });

  it('resends the code with the current challenge and disables the button while waiting', async () => {
    let release: (response: Response) => void = () => undefined;
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockReturnValue(new Promise<Response>((resolve) => (release = resolve)));
    const user = userEvent.setup();
    await renderWithProviders(<VerifyCodeScreen challengeId="challenge-1" onVerified={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Reenviar código' }));

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/resend-code');
    expect(JSON.parse(String(init.body))).toEqual({ challengeId: 'challenge-1' });
    expect(screen.getByRole('button', { name: 'Reenviando…' })).toBeDisabled();

    release(respondWith({ challengeId: 'challenge-1' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reenviar en 0:30' })).toBeDisabled());
  });

  it('shows the message of the API when the code cannot be resent', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 422, [
          { code: 'Identity.TooManyAttempts', message: 'Demasiados intentos, espera 15 minutos.' },
        ]),
      );
    const user = userEvent.setup();
    await renderWithProviders(<VerifyCodeScreen challengeId="challenge-1" onVerified={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Reenviar código' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos, espera 15 minutos.');
  });

  describe('resend confirmation and cooldown', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    async function resend(email?: string) {
      fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockImplementation(() => Promise.resolve(respondWith({ challengeId: 'challenge-1' })));
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await renderWithProviders(<VerifyCodeScreen challengeId="challenge-1" email={email} onVerified={jest.fn()} />);
      await user.press(screen.getByRole('button', { name: 'Reenviar código' }));
      return user;
    }

    it('confirms with the email and starts a 30 second countdown', async () => {
      await resend('ana@correo.com');

      expect(await screen.findByText('Te enviamos un código nuevo a ana@correo.com.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Reenviar en 0:30' })).toBeDisabled();

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByRole('button', { name: 'Reenviar en 0:29' })).toBeDisabled();
    });

    it('confirms without the email when it is unknown', async () => {
      await resend();

      expect(await screen.findByText('Te enviamos un código nuevo.')).toBeOnTheScreen();
    });

    it('enables the button again when the countdown reaches zero', async () => {
      await resend();
      await screen.findByText('Te enviamos un código nuevo.');

      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeEnabled();
    });

    it('does not leave the button locked nor confirm when the resend fails', async () => {
      fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          respondWith(null, 422, [{ code: 'Identity.TooManyAttempts', message: 'Demasiados intentos.' }]),
        );
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await renderWithProviders(<VerifyCodeScreen challengeId="challenge-1" onVerified={jest.fn()} />);

      await user.press(screen.getByRole('button', { name: 'Reenviar código' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos.');
      expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeEnabled();
      expect(screen.queryByText(/Te enviamos un código nuevo/)).toBeNull();
    });

    it('clears the timer when the screen unmounts', async () => {
      await resend();
      await screen.findByText('Te enviamos un código nuevo.');

      const clearSpy = jest.spyOn(globalThis, 'clearInterval');
      await screen.unmount();

      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });
  });
});
