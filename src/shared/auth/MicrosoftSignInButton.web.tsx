import { exchangeCodeAsync, makeRedirectUri, Prompt, ResponseType, useAuthRequest } from 'expo-auth-session';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';

import { env } from '@/shared/config/env';
import { radius, sizes, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import type { MicrosoftSignInButtonProps } from './microsoftSignInTypes';

// Closes the popup and hands the result back to the page that opened it.
maybeCompleteAuthSession();

/** Personal, work and school accounts: the "common" tenant of the Microsoft identity platform (ADR-017). */
const DISCOVERY = {
  authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};
const SCOPES = ['openid', 'profile', 'email'];

// The four squares of the Microsoft logo, with its official colors.
const LOGO_COLORS = ['#F25022', '#7FBA00', '#00A4EF', '#FFB900'];

/**
 * Web: "Continuar con Microsoft", authorization code with PKCE in a popup. The browser exchanges the code for the
 * `idToken` that the API validates. It shows up only when `EXPO_PUBLIC_MICROSOFT_CLIENT_ID` is set.
 */
export function MicrosoftSignInButton({ onIdToken }: MicrosoftSignInButtonProps) {
  const styles = useThemedStyles((colors) => ({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      minHeight: sizes.touch,
      width: 320,
      maxWidth: '100%',
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    logo: { width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
    square: { width: 8, height: 8 },
    label: { ...typography.subtitle, color: colors.text },
  }));
  const clientId = env.microsoftClientId ?? '';
  const redirectUri = makeRedirectUri();
  const [request, , promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: SCOPES,
      redirectUri,
      responseType: ResponseType.Code,
      usePKCE: true,
      prompt: Prompt.SelectAccount,
    },
    DISCOVERY,
  );

  if (!clientId) return null;

  async function signIn() {
    try {
      const result = await promptAsync();
      if (result.type !== 'success' || !result.params.code) return;
      const tokens = await exchangeCodeAsync(
        {
          clientId,
          code: result.params.code,
          redirectUri,
          extraParams: request?.codeVerifier ? { code_verifier: request.codeVerifier } : {},
        },
        DISCOVERY,
      );
      if (tokens.idToken) onIdToken(tokens.idToken);
    } catch {
      // Popup blocked or Microsoft unreachable: email and password still work.
    }
  }

  return (
    <Pressable accessibilityRole="button" onPress={signIn} disabled={!request} style={styles.button}>
      <View style={styles.logo}>
        {LOGO_COLORS.map((color) => (
          <View key={color} style={[styles.square, { backgroundColor: color }]} />
        ))}
      </View>
      <Text style={styles.label}>Continuar con Microsoft</Text>
    </Pressable>
  );
}
