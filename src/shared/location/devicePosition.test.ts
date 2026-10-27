import * as Location from 'expo-location';

import { getDevicePosition, getLocationPermission } from './devicePosition';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const location = jest.mocked(Location);
const granted = {
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
} as Location.LocationPermissionResponse;
const position = {
  coords: { latitude: 4.6361, longitude: -74.0645, accuracy: 12 },
  timestamp: 0,
} as Location.LocationObject;

describe('getLocationPermission', () => {
  it('says whether the permission was never asked, granted or denied, without asking', async () => {
    location.getForegroundPermissionsAsync.mockResolvedValueOnce({ ...granted, status: 'undetermined' } as never);
    expect(await getLocationPermission()).toBe('undetermined');
    location.getForegroundPermissionsAsync.mockResolvedValueOnce(granted);
    expect(await getLocationPermission()).toBe('granted');
    location.getForegroundPermissionsAsync.mockResolvedValueOnce({ ...granted, status: 'denied' } as never);
    expect(await getLocationPermission()).toBe('denied');
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('treats an error reading the permission as never asked', async () => {
    location.getForegroundPermissionsAsync.mockRejectedValueOnce(new Error('no'));
    expect(await getLocationPermission()).toBe('undetermined');
  });
});

describe('getDevicePosition', () => {
  it('returns the position with its accuracy', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue(granted);
    location.getCurrentPositionAsync.mockResolvedValue(position);

    expect(await getDevicePosition()).toEqual({
      coordinates: { latitude: 4.6361, longitude: -74.0645 },
      accuracyMeters: 12,
      approximate: false,
    });
  });

  it('flags an approximate location (iOS "precise location" off or Android coarse)', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({
      ...granted,
      ios: { accuracy: 'reduced', scope: 'whenInUse' },
    });
    location.getCurrentPositionAsync.mockResolvedValue({
      ...position,
      coords: { ...position.coords, accuracy: null },
    } as never);

    expect(await getDevicePosition()).toEqual({
      coordinates: { latitude: 4.6361, longitude: -74.0645 },
      accuracyMeters: null,
      approximate: true,
    });
  });

  it('returns null when the permission is denied or the phone cannot locate itself', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ ...granted, status: 'denied' } as never);
    expect(await getDevicePosition()).toBeNull();

    location.requestForegroundPermissionsAsync.mockResolvedValue({ ...granted, android: { accuracy: 'coarse' } });
    location.getCurrentPositionAsync.mockRejectedValue(new Error('no GPS'));
    expect(await getDevicePosition()).toBeNull();
  });
});
