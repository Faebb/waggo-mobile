import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * The session token needs the OS keychain/keystore (expo-secure-store), but that API has no real web
 * implementation (no keychain in a browser) — it falls back to `localStorage` there instead.
 */
export const secureStorage = {
  getItem: (key: string): Promise<string | null> =>
    Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key),

  setItem: (key: string, value: string): Promise<void> =>
    Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),

  deleteItem: (key: string): Promise<void> =>
    Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};
