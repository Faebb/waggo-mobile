import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { THEME_MODE_STORAGE_KEY, setThemeMode, useThemeMode, type ThemeMode } from './theme';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

/**
 * Loads the saved theme mode on first mount and persists it afterwards. Mounted once at the app root
 * (`src/app/_layout.tsx`); `useThemeMode`/`useColors` work anywhere without needing a wrapping provider.
 */
export function useHydrateThemeMode() {
  const mode = useThemeMode();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_MODE_STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (isThemeMode(stored)) setThemeMode(stored);
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  }, [hydrated, mode]);
}
