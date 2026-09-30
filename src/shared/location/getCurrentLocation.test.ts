import * as Location from 'expo-location';

import { getCurrentLocation } from './getCurrentLocation';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const location = jest.mocked(Location);

describe('getCurrentLocation', () => {
  it('returns the coordinates when the permission is granted', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 4.6361, longitude: -74.0645 } } as never);

    await expect(getCurrentLocation()).resolves.toEqual({ latitude: 4.6361, longitude: -74.0645 });
  });

  it('returns null when the permission is denied, without reading the position', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);

    await expect(getCurrentLocation()).resolves.toBeNull();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('returns null when the device cannot locate itself', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    location.getCurrentPositionAsync.mockRejectedValue(new Error('GPS off'));

    await expect(getCurrentLocation()).resolves.toBeNull();
  });
});
