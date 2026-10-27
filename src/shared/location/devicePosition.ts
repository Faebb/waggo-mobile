import * as Location from 'expo-location';

import type { Coordinates } from './getCurrentLocation';

export type LocationPermission = 'undetermined' | 'granted' | 'denied';

/** A position with how much to trust it (design 04 · 5: approximate location and weak GPS). */
export type DevicePosition = {
  coordinates: Coordinates;
  /** Radius of uncertainty in meters; null when the platform does not say (web). */
  accuracyMeters: number | null;
  /** iOS "Ubicación precisa" off or Android approximate location. */
  approximate: boolean;
};

/** GPS uncertainty above which the screen warns "Señal GPS débil" (⚠️ provisional, design 04 · 5). */
export const WEAK_GPS_METERS = 50;

/** Reads the permission without asking, so the screen can explain before the system dialog (design 04 · 5). */
export async function getLocationPermission(): Promise<LocationPermission> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) return 'granted';
    if (status === Location.PermissionStatus.DENIED) return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/** Asks for the permission (only while the app is in use) and reads the position with its accuracy. */
export async function getDevicePosition(): Promise<DevicePosition | null> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) return null;
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      coordinates: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      accuracyMeters: position.coords.accuracy,
      approximate: permission.ios?.accuracy === 'reduced' || permission.android?.accuracy === 'coarse',
    };
  } catch {
    return null;
  }
}
