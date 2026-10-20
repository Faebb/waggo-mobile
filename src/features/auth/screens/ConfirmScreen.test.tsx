import { screen, userEvent, waitFor } from '@testing-library/react-native';

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

describe('ConfirmScreen (RF-001)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('confirms the account with the pasted token', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    const onConfirmed = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={onConfirmed} />);

    expect(screen.getByText('ana@mail.com')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Enlace de confirmación'), 'raw-token');
    await user.press(screen.getByRole('button', { name: 'Confirmar cuenta' }));

    await waitFor(() => expect(onConfirmed).toHaveBeenCalledTimes(1));
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toMatch(/\/api\/v1\/auth\/confirm\?token=raw-token$/);
  });

  it('shows the message of the API when the token is invalid', async () => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        respondWith(null, 404, [{ code: 'Identity.ConfirmationTokenInvalid', message: 'El enlace no es válido.' }]),
      );
    const user = userEvent.setup();
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

    await user.type(screen.getByLabelText('Enlace de confirmación'), 'wrong-token');
    await user.press(screen.getByRole('button', { name: 'Confirmar cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El enlace no es válido.');
  });

  it('disables the action until a token is entered', async () => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(true));
    await renderWithProviders(<ConfirmScreen email="ana@mail.com" onConfirmed={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Confirmar cuenta' })).toBeDisabled();
  });
});
