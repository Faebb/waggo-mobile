import { Platform, Text, View } from 'react-native';

import { env } from '@/shared/config/env';
import { spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { GoogleSignInButton } from './GoogleSignInButton';
import { MicrosoftSignInButton } from './MicrosoftSignInButton';

type Props = {
  onGoogleIdToken: (idToken: string) => void;
  onMicrosoftIdToken: (idToken: string) => void;
};

/** The sign-in buttons of the identity providers (ADR-017), under a single "o" divider. Web only for now. */
export function SocialSignIn({ onGoogleIdToken, onMicrosoftIdToken }: Props) {
  const styles = useThemedStyles((colors) => ({
    section: { gap: spacing.md, alignItems: 'center' },
    divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, alignSelf: 'stretch' },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    or: { ...typography.caption, color: colors.muted },
  }));
  const available = Platform.OS === 'web' && Boolean(env.googleWebClientId || env.microsoftClientId);

  return (
    <View style={styles.section}>
      {available ? (
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>o</Text>
          <View style={styles.line} />
        </View>
      ) : null}
      <GoogleSignInButton onIdToken={onGoogleIdToken} />
      <MicrosoftSignInButton onIdToken={onMicrosoftIdToken} />
    </View>
  );
}
