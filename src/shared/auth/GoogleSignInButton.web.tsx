import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { env } from '@/shared/config/env';
import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { loadGoogleIdentity, renderGoogleButton } from './googleIdentity';
import type { GoogleSignInButtonProps } from './googleSignInTypes';

const BUTTON_WIDTH = 320;

/**
 * Web: the official Google button (Google Identity Services), under an "o" divider. It shows up only when
 * `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set and the Google script loads; otherwise the screen stays email-only.
 */
export function GoogleSignInButton({ onIdToken }: GoogleSignInButtonProps) {
  const styles = useThemedStyles((colors) => ({
    section: { gap: spacing.md, alignItems: 'center' },
    divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, alignSelf: 'stretch' },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    or: { ...typography.caption, color: colors.muted },
  }));
  const container = useRef<HTMLDivElement>(null);
  // The latest callback, without drawing the button again every time the screen re-renders.
  const callback = useRef(onIdToken);
  useEffect(() => {
    callback.current = onIdToken;
  });
  const [ready, setReady] = useState(false);
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
        setReady(true);
      })
      .catch(() => undefined); // Script blocked or offline: email and password still work.
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) return null;

  return (
    <View style={styles.section}>
      {ready ? (
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>o</Text>
          <View style={styles.line} />
        </View>
      ) : null}
      <div ref={container} />
    </View>
  );
}
