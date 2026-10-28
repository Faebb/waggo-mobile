/** The only script we load from Google: Google Identity Services, the way Google asks websites to sign people in. */
export const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

export type GoogleCredentialResponse = { credential?: string };

/** The small part of the Google Identity Services API that Waggo uses. */
export type GoogleIdentityApi = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

type GoogleGlobal = typeof globalThis & { google?: GoogleIdentityApi };

let loading: Promise<GoogleIdentityApi> | undefined;

function loadedApi(): GoogleIdentityApi | undefined {
  const google = (globalThis as GoogleGlobal).google;
  return google?.accounts?.id ? google : undefined;
}

/**
 * ADR-017 (web): adds the Google script once and resolves with its API. If the script is blocked or fails, the
 * promise rejects and the next call tries again; the person can still sign in with email and password.
 */
export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  const ready = loadedApi();
  if (ready) return Promise.resolve(ready);

  loading ??= new Promise<GoogleIdentityApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const api = loadedApi();
      if (api) {
        resolve(api);
        return;
      }
      loading = undefined;
      reject(new Error('Google Identity Services loaded without its API.'));
    };
    script.onerror = () => {
      loading = undefined;
      reject(new Error('Google Identity Services could not be downloaded.'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

type GoogleButtonOptions = {
  /** The OAuth web client id (public; created in Google Cloud). */
  clientId: string;
  /** Pixels; Google accepts 200 to 400. */
  width: number;
  /** The `idToken` Google issued for this client: the API validates it (POST /auth/login/google). */
  onIdToken: (idToken: string) => void;
};

/** Draws Google's own "Continuar con Google" button inside `container` and reports the idToken when used. */
export function renderGoogleButton(google: GoogleIdentityApi, container: HTMLElement, options: GoogleButtonOptions) {
  google.accounts.id.initialize({
    client_id: options.clientId,
    callback: (response) => {
      if (response.credential) options.onIdToken(response.credential);
    },
  });
  google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'left',
    locale: 'es',
    width: options.width,
  });
}
