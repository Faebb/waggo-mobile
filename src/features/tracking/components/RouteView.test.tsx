import { render, screen } from '@testing-library/react-native';

import { RouteView } from './RouteView';

describe('RouteView (RF-008, RF-011)', () => {
  it('shows the walked distance and time', async () => {
    await render(
      <RouteView
        route={{
          points: [
            { latitude: 4.6361, longitude: -74.0645, recordedAt: '2026-09-30T15:00:00Z' },
            { latitude: 4.645, longitude: -74.0645, recordedAt: '2026-09-30T15:18:00Z' },
          ],
          distanceKm: 0.99,
          elapsedMinutes: 18,
        }}
      />,
    );

    expect(screen.getByText('0,99 km')).toBeOnTheScreen();
    expect(screen.getByText('18 min')).toBeOnTheScreen();
    expect(screen.getByLabelText('Ruta del paseo')).toBeOnTheScreen();
  });

  it('waits for the first position', async () => {
    await render(<RouteView route={{ points: [], distanceKm: 0, elapsedMinutes: 0 }} />);

    expect(screen.getByText('Esperando la primera ubicación…')).toBeOnTheScreen();
  });
});
