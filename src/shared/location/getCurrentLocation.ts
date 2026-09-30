import * as Location from 'expo-location';

export type Coordinates = { latitude: number; longitude: number };

/**
 * Asks for the location permission (only while the app is in use) and reads the current position.
 * Returns null when the owner denies the permission or the device cannot locate itself.
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      return null;
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null;
  }
}
