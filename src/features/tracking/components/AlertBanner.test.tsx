import { render, screen } from '@testing-library/react-native';

import { AlertBanner } from './AlertBanner';

const alert = {
  id: 'alert-1',
  kind: 'Emergency' as 'Emergency' | 'Geofence' | 'Anomaly',
  raisedBy: 'Walker' as 'Owner' | 'Walker' | null,
  message: 'Luna se soltó',
  latitude: null,
  longitude: null,
  raisedAt: new Date(2026, 8, 30, 15, 10).toISOString(),
};

describe('AlertBanner (RF-012)', () => {
  it('tells the owner that the walker raised an emergency, with the message and time', async () => {
    await render(<AlertBanner alert={alert} viewer="Owner" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/El paseador reportó una emergencia/);
    expect(screen.getByText('Luna se soltó')).toBeOnTheScreen();
    expect(screen.getByText('15:10')).toBeOnTheScreen();
  });

  it('tells the walker that the owner raised it', async () => {
    await render(<AlertBanner alert={{ ...alert, raisedBy: 'Owner', message: null }} viewer="Walker" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/El dueño reportó una emergencia/);
  });

  it('tells both that the walk left the agreed zone (RF-009)', async () => {
    await render(<AlertBanner alert={{ ...alert, kind: 'Geofence', raisedBy: null, message: null }} viewer="Owner" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/El paseo salió de la zona acordada/);
  });

  it('tells both that the walker has been stopped for a while (RF-010)', async () => {
    await render(<AlertBanner alert={{ ...alert, kind: 'Anomaly', raisedBy: null, message: null }} viewer="Walker" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/El paseo lleva 10 minutos detenido/);
  });

  it('confirms to whoever raised it', async () => {
    await render(<AlertBanner alert={alert} viewer="Walker" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/Reportaste una emergencia/);
  });
});
