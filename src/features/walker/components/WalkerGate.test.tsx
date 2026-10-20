import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';

import { approvedWalkerProfile, pendingWalkerProfile } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { WalkerGate } from './WalkerGate';

const home = <Text>Solicitudes</Text>;

describe('WalkerGate (RF-002, RF-003)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('lets a verified walker in', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walkers/me', data: approvedWalkerProfile }]);

    await renderWithProviders(<WalkerGate>{home}</WalkerGate>);

    expect(await screen.findByText('Solicitudes')).toBeOnTheScreen();
  });

  it('asks a new walker to register', async () => {
    fetchSpy = mockApi([]);

    await renderWithProviders(<WalkerGate>{home}</WalkerGate>);

    expect(await screen.findByRole('header', { name: 'Hazte paseador' })).toBeOnTheScreen();
    expect(screen.queryByText('Solicitudes')).toBeNull();
  });

  it('tells a pending walker that the profile is being verified', async () => {
    fetchSpy = mockApi([{ path: '/api/v1/walkers/me', data: pendingWalkerProfile }]);

    await renderWithProviders(<WalkerGate>{home}</WalkerGate>);

    expect(await screen.findByRole('header', { name: 'Estamos verificando tu perfil' })).toBeOnTheScreen();
    expect(screen.getByText('CC ···· 4050')).toBeOnTheScreen();
    expect(screen.queryByText('Solicitudes')).toBeNull();
  });

  it('shows a rejected walker why', async () => {
    fetchSpy = mockApi([
      {
        path: '/api/v1/walkers/me',
        data: { ...pendingWalkerProfile, status: 'Rejected', rejectionReason: 'La foto del documento no se lee.' },
      },
    ]);

    await renderWithProviders(<WalkerGate>{home}</WalkerGate>);

    expect(await screen.findByRole('header', { name: 'No pudimos verificar tu perfil' })).toBeOnTheScreen();
    expect(screen.getByText('La foto del documento no se lee.')).toBeOnTheScreen();
  });
});
