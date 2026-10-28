import type { MicrosoftSignInButtonProps } from './microsoftSignInTypes';

/**
 * iOS/Android: no Microsoft button yet. It needs a redirect scheme registered for the development build (EAS), so it
 * arrives with that build (ADR-017). Email and password keep working.
 */
export function MicrosoftSignInButton(_props: MicrosoftSignInButtonProps) {
  return null;
}
