import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkSafety } from './WalkSafety';

jest.mock('@/shared/location/getCurrentLocation');
const mockedLocation = jest.mocked(getCurrentLocation);

const raised = {
  id: 'alert-1',
  kind: 'Emergency',
  raisedBy: 'Owner',
  message: null,
  latitude: 4.64,
  longitude: -74.062,
  raisedAt: '2026-09-30T15:10:00+00:00',
};

describe('WalkSafety (RF-012)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows the latest alert of the walk', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1/alerts', data: [{ ...raised, raisedBy: 'Walker' }] }]);

    await renderWithProviders(<WalkSafety walkId="walk-1" viewer="Owner" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/El paseador reportó una emergencia/);
  });

  it('raises an emergency with the current location', async () => {
    mockedLocation.mockResolvedValue({ latitude: 4.64, longitude: -74.062 });
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1/alerts', data: [] },
      { method: 'POST', path: '/api/v1/walks/walk-1/emergency', data: raised },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<WalkSafety walkId="walk-1" viewer="Owner" />);

    await user.press(await screen.findByRole('button', { name: 'Emergencia' }));
    await user.press(screen.getByRole('button', { name: 'Sí, es una emergencia' }));

    await waitFor(() => {
      const post = fetchSpy.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
      expect(JSON.parse(String((post![1] as RequestInit).body))).toEqual({ latitude: 4.64, longitude: -74.062 });
    });
    expect(await screen.findByText('Emergencia enviada. Mantén la calma; el paseo quedó marcado.')).toBeOnTheScreen();
  });
});
