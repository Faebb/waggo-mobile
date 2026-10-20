import { screen, userEvent, waitFor } from '@testing-library/react-native';

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
});
