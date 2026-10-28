export type GoogleSignInButtonProps = {
  /** The `idToken` Google issued after the person chose their account; the API validates it. */
  onIdToken: (idToken: string) => void;
};
