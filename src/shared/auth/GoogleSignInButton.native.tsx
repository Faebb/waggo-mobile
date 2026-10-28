import type { GoogleSignInButtonProps } from './googleSignInTypes';

/**
 * iOS/Android: no Google button yet. Google's native sign-in needs custom native code, so it only works in a
 * development build (EAS), not in Expo Go; it arrives with that build (ADR-017). Email and password keep working.
 */
export function GoogleSignInButton(_props: GoogleSignInButtonProps) {
  return null;
}
