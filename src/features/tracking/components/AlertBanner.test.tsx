import { render, screen } from '@testing-library/react-native';

import { AlertBanner } from './AlertBanner';

const alert = {
  id: 'alert-1',
  kind: 'Emergency' as const,
  raisedBy: 'Walker' as const,
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

  it('confirms to whoever raised it', async () => {
    await render(<AlertBanner alert={alert} viewer="Walker" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/Reportaste una emergencia/);
  });
});
