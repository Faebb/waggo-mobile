import { act, screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { ConfirmScreen } from './ConfirmScreen';

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

const CODE_LABEL = 'Código de confirmación';

describe('ConfirmScreen (RF-001)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('confirms the account with the typed 6-digit code', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const onConfirmed = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={onConfirmed} />);

    expect(screen.getByText('ana@mail.com')).toBeOnTheScreen();
    await user.type(screen.getByLabelText(CODE_LABEL), '004821');
    await user.press(screen.getByRole('button', { name: 'Confirmar cuenta' }));

    await waitFor(() => expect(onConfirmed).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/confirm$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'ana@mail.com', code: '004821' });
  });

  it('keeps only digits and stops at six', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

    await user.type(screen.getByLabelText(CODE_LABEL), '12a4-5 678');

    expect(screen.getByLabelText(CODE_LABEL)).toHaveDisplayValue('124567');
  });

  it('disables the action until the code has 6 digits', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const user = userEvent.setup();
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Confirmar cuenta' })).toBeDisabled();
    await user.type(screen.getByLabelText(CODE_LABEL), '12345');
    expect(screen.getByRole('button', { name: 'Confirmar cuenta' })).toBeDisabled();
    await user.type(screen.getByLabelText(CODE_LABEL), '6');
    expect(screen.getByRole('button', { name: 'Confirmar cuenta' })).toBeEnabled();
  });

  it('shows the message of the API when the code is invalid', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 404, [{ code: 'Identity.ConfirmationTokenInvalid', message: 'El código no es válido.' }]),
      );
    const user = userEvent.setup();
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

    await user.type(screen.getByLabelText(CODE_LABEL), '111111');
    await user.press(screen.getByRole('button', { name: 'Confirmar cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El código no es válido.');
  });

  describe('resending the code', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    async function waitTheMinute() {
      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
    }

    it('makes the person wait 60 seconds, then asks for a new code', async () => {
      fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Reenviar código en 60 s' })).toBeDisabled();

      await waitTheMinute();
      await user.press(screen.getByRole('button', { name: 'Reenviar código' }));

      expect(await screen.findByText('Te enviamos un código nuevo.')).toBeOnTheScreen();
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toMatch(/\/api\/v1\/auth\/resend-confirmation$/);
      expect(JSON.parse(init.body as string)).toEqual({ email: 'ana@mail.com' });
      expect(screen.getByRole('button', { name: 'Reenviar código en 60 s' })).toBeDisabled();
    });

    it('shows the message of the API when the new code cannot be sent', async () => {
      fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          respondWith(null, 503, [{ code: 'Email.SendFailed', message: 'No pudimos enviar el correo.' }]),
        );
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

      await waitTheMinute();
      await user.press(screen.getByRole('button', { name: 'Reenviar código' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos enviar el correo.');
      expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeEnabled();
    });
  });
});
