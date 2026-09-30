import { screen } from '@testing-library/react-native';

import { acceptedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { AssignedWalkScreen } from './AssignedWalkScreen';

describe('AssignedWalkScreen (RF-007)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows the accepted walk with the pickup, the notes and the payout', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: acceptedWalk }]);

    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    expect(await screen.findByRole('header', { name: 'Paseo aceptado' })).toBeOnTheScreen();
    expect(screen.getByText('Cra 7 # 45-10, Bogotá')).toBeOnTheScreen();
    expect(screen.getByText('Timbre dañado')).toBeOnTheScreen();
    expect(screen.getByText('Individual · 60 min · 1 perro')).toBeOnTheScreen();
    expect(screen.getByText('$ 18.400')).toBeOnTheScreen();
  });

  it('tells the walker when the owner cancelled', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walks/walk-1', data: { ...acceptedWalk, status: 'Cancelled' } }]);

    await renderWithProviders(<AssignedWalkScreen walkId="walk-1" />);

    expect(await screen.findByRole('header', { name: 'El dueño canceló el paseo' })).toBeOnTheScreen();
  });
});
