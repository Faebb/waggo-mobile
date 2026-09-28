import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';

import { FareQuoteScreen } from './FareQuoteScreen';

/** Fake backend that applies the same provisional rates as waggo-api (see vault › Flujo TDD). */
function fakeApi(url: string) {
  // React Native's URL polyfill has no searchParams, so parse the query by hand.
  const params = Object.fromEntries(
    (url.split('?')[1] ?? '').split('&').map((pair) => pair.split('=').map(decodeURIComponent)),
  );
  const walkType = params.walkType;
  const minutes = Number(params.durationMinutes);
  const [base, perMinute] = walkType === 'Group' ? [5000, 150] : [8000, 250];
  const total = Math.round((base + perMinute * minutes) / 100) * 100;
  const commission = Math.round(total * 0.2);
  const data = { walkType, durationMinutes: minutes, currency: 'COP', total, commission, walkerPayout: total - commission };
  return new Response(
    JSON.stringify({ success: true, data, pagination: null, errors: [], warnings: [], infos: [], traceId: 't' }),
    { status: 200 },
  );
}

describe('FareQuoteScreen (RF-019)', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input) => fakeApi(String(input)));
  });

  afterEach(() => fetchSpy.mockRestore());

  it('shows the price of the default selection (individual, 60 min)', async () => {
    await renderWithProviders(<FareQuoteScreen />);

    expect(await screen.findByText('$ 23.000')).toBeOnTheScreen();
  });

  it('updates the price when the owner changes type and duration', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<FareQuoteScreen />);
    await screen.findByText('$ 23.000');

    await user.press(screen.getByRole('button', { name: 'Grupal' }));
    await user.press(screen.getByRole('button', { name: '45 min' }));

    expect(await screen.findByText('$ 11.800')).toBeOnTheScreen();
  });

  it('shows a friendly error when the API fails', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          data: null,
          pagination: null,
          errors: [{ code: 'Server.Unexpected', message: 'Boom' }],
          warnings: [],
          infos: [],
          traceId: 't',
        }),
        { status: 500 },
      ),
    );

    await renderWithProviders(<FareQuoteScreen />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos calcular la tarifa. Intenta de nuevo.');
  });
});
