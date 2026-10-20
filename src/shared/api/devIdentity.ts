/**
 * Development identity (ADR-011) while there is no login: the app tells the development user of waggo-api who it
 * is with the X-Dev-User-Id and X-Dev-Roles headers. The owner and the walker are different users, so a walker
 * can accept an owner's walk. The API only reads these headers when its development user is on; with real
 * OAuth tokens they are ignored. Remove this file when the login exists.
 */
export type DevRole = 'owner' | 'walker';

const IDENTITIES: Record<DevRole, Record<string, string>> = {
  owner: { 'X-Dev-User-Id': 'dev-owner', 'X-Dev-Roles': 'owner' },
  walker: { 'X-Dev-User-Id': 'dev-walker', 'X-Dev-Roles': 'walker' },
};

let currentRole: DevRole | null = null;

/** Called by the owner and walker routes, so every request of that side goes as that user. */
export function setDevRole(role: DevRole | null) {
  currentRole = role;
}

export function devIdentityHeaders(): Record<string, string> {
  return currentRole ? IDENTITIES[currentRole] : {};
}
