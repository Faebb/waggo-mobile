/**
 * @jest-environment jsdom
 */
import type * as GoogleIdentity from './googleIdentity';

type Loader = typeof GoogleIdentity;

/** A fresh copy of the module per test: the script loader remembers the page it already loaded. */
function freshModule(): Loader {
  let module!: Loader;
  jest.isolateModules(() => {
    module = jest.requireActual<Loader>('./googleIdentity');
  });
  return module;
}

function fakeGoogle() {
  const initialize = jest.fn();
  const renderButton = jest.fn();
  const google = { accounts: { id: { initialize, renderButton } } } satisfies GoogleIdentity.GoogleIdentityApi;
  return { google, initialize, renderButton };
}

function injectedScripts() {
  return Array.from(document.head.querySelectorAll('script[src*="accounts.google.com/gsi/client"]'));
}

describe('googleIdentity (ADR-017, Google sign-in on the web)', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    delete (globalThis as { google?: unknown }).google;
  });

  describe('loadGoogleIdentity', () => {
    it('adds the Google Identity Services script once and resolves with the API when it loads', async () => {
      const { loadGoogleIdentity } = freshModule();
      const { google } = fakeGoogle();

      const first = loadGoogleIdentity();
      const second = loadGoogleIdentity();

      expect(injectedScripts()).toHaveLength(1);
      (globalThis as { google?: unknown }).google = google;
      (injectedScripts()[0] as HTMLScriptElement).onload?.(new Event('load'));
      await expect(first).resolves.toBe(google);
      await expect(second).resolves.toBe(google);
    });

    it('resolves right away when the API is already on the page', async () => {
      const { loadGoogleIdentity } = freshModule();
      const { google } = fakeGoogle();
      (globalThis as { google?: unknown }).google = google;

      await expect(loadGoogleIdentity()).resolves.toBe(google);
      expect(injectedScripts()).toHaveLength(0);
    });

    it('rejects when the script cannot be downloaded, and a later call tries again', async () => {
      const { loadGoogleIdentity } = freshModule();

      const blocked = loadGoogleIdentity();
      (injectedScripts()[0] as HTMLScriptElement).onerror?.(new Event('error'));
      await expect(blocked).rejects.toThrow();

      const retry = loadGoogleIdentity();
      expect(injectedScripts()).toHaveLength(2);
      void retry.catch(() => undefined);
    });

    it('rejects when the script loads but the API is missing', async () => {
      const { loadGoogleIdentity } = freshModule();

      const loading = loadGoogleIdentity();
      (injectedScripts()[0] as HTMLScriptElement).onload?.(new Event('load'));

      await expect(loading).rejects.toThrow();
    });
  });

  describe('renderGoogleButton', () => {
    it('draws the official button in Spanish with the text "Continuar con Google"', () => {
      const { renderGoogleButton } = freshModule();
      const { google, initialize, renderButton } = fakeGoogle();
      const container = document.createElement('div');

      renderGoogleButton(google, container, { clientId: 'client-id', width: 320, onIdToken: jest.fn() });

      expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: 'client-id' }));
      expect(renderButton).toHaveBeenCalledWith(
        container,
        expect.objectContaining({ text: 'continue_with', locale: 'es', width: 320 }),
      );
    });

    it('hands the idToken (the credential) to the caller when the person signs in', () => {
      const { renderGoogleButton } = freshModule();
      const { google, initialize } = fakeGoogle();
      const onIdToken = jest.fn();
      renderGoogleButton(google, document.createElement('div'), { clientId: 'client-id', width: 320, onIdToken });

      const { callback } = initialize.mock.calls[0][0] as { callback: (response: { credential?: string }) => void };
      callback({ credential: 'eyJ.payload.signature' });

      expect(onIdToken).toHaveBeenCalledWith('eyJ.payload.signature');
    });

    it('ignores a response without credential', () => {
      const { renderGoogleButton } = freshModule();
      const { google, initialize } = fakeGoogle();
      const onIdToken = jest.fn();
      renderGoogleButton(google, document.createElement('div'), { clientId: 'client-id', width: 320, onIdToken });

      const { callback } = initialize.mock.calls[0][0] as { callback: (response: { credential?: string }) => void };
      callback({});

      expect(onIdToken).not.toHaveBeenCalled();
    });
  });
});
