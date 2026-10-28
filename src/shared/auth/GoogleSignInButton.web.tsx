import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { env } from '@/shared/config/env';

import { loadGoogleIdentity, renderGoogleButton } from './googleIdentity';
import type { GoogleSignInButtonProps } from './googleSignInTypes';

const BUTTON_WIDTH = 320;

/**
 * Web: the official Google button (Google Identity Services). It shows up only when
 * `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set and the Google script loads; otherwise the screen stays email-only.
 */
export function GoogleSignInButton({ onIdToken }: GoogleSignInButtonProps) {
  const container = useRef<HTMLDivElement>(null);
  // The latest callback, without drawing the button again every time the screen re-renders.
  const callback = useRef(onIdToken);
  useEffect(() => {
    callback.current = onIdToken;
  });
  const clientId = env.googleWebClientId;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !container.current) return;
        renderGoogleButton(google, container.current, {
          clientId,
          width: BUTTON_WIDTH,
          onIdToken: (idToken) => callback.current(idToken),
        });
      })
      .catch(() => undefined); // Script blocked or offline: email and password still work.
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) return null;

  return (
    <View>
      <div ref={container} />
    </View>
  );
}
