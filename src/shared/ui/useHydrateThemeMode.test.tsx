import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';

import { getThemeMode, setThemeMode, THEME_MODE_STORAGE_KEY } from './theme';
import { useHydrateThemeMode } from './useHydrateThemeMode';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('useHydrateThemeMode', () => {
  beforeEach(() => {
    setThemeMode('dark');
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('applies a previously saved mode on mount', async () => {
    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, 'light');

    await renderHook(() => useHydrateThemeMode());

    await waitFor(() => expect(getThemeMode()).toBe('light'));
  });

  it('keeps the default mode when nothing was saved yet', async () => {
    await renderHook(() => useHydrateThemeMode());

    await waitFor(async () => expect(await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark'));

    expect(getThemeMode()).toBe('dark');
  });

  it('persists the mode once the user switches it', async () => {
    await renderHook(() => useHydrateThemeMode());

    await waitFor(async () => expect(await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark'));

    setThemeMode('light');

    await waitFor(async () => expect(await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('light'));
  });
});
