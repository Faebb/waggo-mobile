import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { ForgotPasswordScreen } from './ForgotPasswordScreen';

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

describe('ForgotPasswordScreen (RF-001, RF-005)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('asks for the code and moves on to the reset screen with the email', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const onCodeSent = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ForgotPasswordScreen initialEmail="" onCodeSent={onCodeSent} />);

    await user.type(screen.getByLabelText('Correo'), 'ana@mail.com');
    await user.press(screen.getByRole('button', { name: 'Enviar código' }));

    await waitFor(() => expect(onCodeSent).toHaveBeenCalledWith('ana@mail.com'));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/forgot-password$/);
    expect(JSON.parse(String(init.body))).toEqual({ email: 'ana@mail.com' });
  });

  it('starts with the email already typed on the login screen', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    await renderWithProviders(<ForgotPasswordScreen initialEmail="ana@mail.com" onCodeSent={jest.fn()} />);

    expect(screen.getByLabelText('Correo')).toHaveDisplayValue('ana@mail.com');
  });

  it('keeps the action disabled while the email is empty', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    await renderWithProviders(<ForgotPasswordScreen initialEmail="" onCodeSent={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeDisabled();
  });

  it('shows the message of the API when the email is malformed', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 400, [
          { code: 'Request.InvalidValue', message: 'Escribe un correo con el formato nombre@dominio.com.' },
        ]),
      );
    const onCodeSent = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ForgotPasswordScreen initialEmail="" onCodeSent={onCodeSent} />);

    await user.type(screen.getByLabelText('Correo'), 'ana');
    await user.press(screen.getByRole('button', { name: 'Enviar código' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe un correo con el formato nombre@dominio.com.');
    expect(onCodeSent).not.toHaveBeenCalled();
  });

  it('shows the message of the API when the email provider is down', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 503, [
          { code: 'Email.SendFailed', message: 'No pudimos enviar el correo. Intenta de nuevo.' },
        ]),
      );
    const user = userEvent.setup();
    await renderWithProviders(<ForgotPasswordScreen initialEmail="ana@mail.com" onCodeSent={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Enviar código' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos enviar el correo. Intenta de nuevo.');
  });
});
