import { render, screen, userEvent } from '@testing-library/react-native';

import type { AdminOperations } from '../model/operations';
import { OperationPanel } from './OperationPanel';

const NOW = new Date('2026-10-02T15:10:00Z');

const operations: AdminOperations = {
  available: true,
  alerts: [
    {
      id: 'a-1',
      walkId: 'walk-1',
      kind: 'Emergency',
      petName: 'Luna',
      walkerName: 'Bruno C.',
      ownerName: 'Valentina R.',
      raisedAt: '2026-10-02T15:08:00Z',
    },
    {
      id: 'a-2',
      walkId: 'walk-2',
      kind: 'Geofence',
      petName: 'Max',
      walkerName: 'Camila T.',
      ownerName: 'Pedro L.',
      raisedAt: '2026-10-02T15:05:00Z',
    },
  ],
  activeWalks: [
    {
      walkId: 'walk-1',
      petName: 'Luna',
      walkerName: 'Bruno C.',
      area: 'Chapinero',
      status: 'InProgress',
      elapsedMinutes: 24,
      durationMinutes: 60,
      lastSignalAt: '2026-10-02T15:09:50Z',
    },
    {
      walkId: 'walk-3',
      petName: 'Rocky',
      walkerName: 'Andrés G.',
      area: 'Usaquén',
      status: 'Accepted',
      elapsedMinutes: 0,
      durationMinutes: 45,
      lastSignalAt: null,
    },
  ],
};

describe('OperationPanel (RF-002/RF-003 panel, slices 2–3)', () => {
  it('says the view is coming soon while the API has no global endpoint', async () => {
    await render(
      <OperationPanel operations={{ available: false, alerts: [], activeWalks: [] }} onOpenWalk={jest.fn()} />,
    );

    expect(screen.getByRole('header', { name: 'Próximamente' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: /Alertas/ })).toBeNull();
  });

  it('lists active emergencies apart from the automatic alerts', async () => {
    await render(<OperationPanel operations={operations} onOpenWalk={jest.fn()} now={NOW} />);

    expect(screen.getByText('EMERGENCIAS ACTIVAS · 1')).toBeTruthy();
    expect(screen.getByText('Emergencia · Luna')).toBeTruthy();
    expect(screen.getByText('Bruno C. / Valentina R. · hace 2 min')).toBeTruthy();
    expect(screen.getByText('ALERTAS AUTOMÁTICAS · 1')).toBeTruthy();
    expect(screen.getByText('Salió de la zona · Max')).toBeTruthy();
    expect(screen.getByText('Paseo de Camila T. · hace 5 min')).toBeTruthy();
  });

  it('opens the walk of an emergency', async () => {
    const onOpenWalk = jest.fn();
    const user = userEvent.setup();
    await render(<OperationPanel operations={operations} onOpenWalk={onOpenWalk} now={NOW} />);

    await user.press(screen.getByRole('button', { name: 'Ver paseo de Luna' }));

    expect(onOpenWalk).toHaveBeenCalledWith('walk-1');
  });

  it('shows the walks in progress with their last signal', async () => {
    const user = userEvent.setup();
    await render(<OperationPanel operations={operations} onOpenWalk={jest.fn()} now={NOW} />);

    await user.press(screen.getByRole('tab', { name: 'En curso · 2' }));

    expect(screen.getByText('PASEOS EN CURSO · 2')).toBeTruthy();
    expect(screen.getByText('Chapinero · 24 de 60 min · señal hace un momento')).toBeTruthy();
    expect(screen.getByText('Usaquén · aceptado, por iniciar')).toBeTruthy();
    expect(screen.getByText('Aceptado')).toBeTruthy();
  });

  it('flags "Sin señal" once the last signal is more than 30 seconds old (PO threshold)', async () => {
    const user = userEvent.setup();
    const at = (seconds: number) => ({
      ...operations,
      activeWalks: [
        { ...operations.activeWalks[0], lastSignalAt: new Date(NOW.getTime() - seconds * 1000).toISOString() },
      ],
    });
    const { rerender } = await render(<OperationPanel operations={at(30)} onOpenWalk={jest.fn()} now={NOW} />);
    await user.press(screen.getByRole('tab', { name: /En curso/ }));
    expect(screen.queryByText('Sin señal')).toBeNull();

    await rerender(<OperationPanel operations={at(31)} onOpenWalk={jest.fn()} now={NOW} />);

    expect(screen.getByText('Sin señal')).toBeTruthy();
  });

  it('says when there are no active alerts', async () => {
    await render(<OperationPanel operations={{ ...operations, alerts: [] }} onOpenWalk={jest.fn()} now={NOW} />);

    expect(screen.getByText('No hay alertas activas.')).toBeTruthy();
  });
});
