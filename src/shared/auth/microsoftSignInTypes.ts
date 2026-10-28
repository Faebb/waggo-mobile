export type MicrosoftSignInButtonProps = {
  /** The `idToken` Microsoft issued after the person chose their account; the API validates it. */
  onIdToken: (idToken: string) => void;
};
