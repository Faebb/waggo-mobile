export type PasswordRule = { label: string; test: (password: string) => boolean };

/**
 * The password rules waggo-api enforces (`Identity.WeakPassword`, RF-001 spec; the values are provisional there).
 * The register screen checks them live so the user does not have to wait for the API error.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  { label: 'Al menos 8 caracteres', test: (password) => password.length >= 8 },
  { label: 'Una mayúscula', test: (password) => /[A-ZÁÉÍÓÚÑ]/.test(password) },
  { label: 'Un número', test: (password) => /\d/.test(password) },
];

export function meetsPasswordRules(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
