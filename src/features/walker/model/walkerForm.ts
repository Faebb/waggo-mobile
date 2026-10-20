import type { DocumentType, WalkerDraft } from './types';

/** What the walker typed in "Hazte paseador", as raw text. */
export type WalkerForm = {
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  experience: string;
};

export type WalkerFormErrors = Partial<Record<'fullName' | 'documentNumber' | 'phone', string>>;

export const EMPTY_WALKER_FORM: WalkerForm = {
  fullName: '',
  documentType: 'CC',
  documentNumber: '',
  phone: '',
  experience: '',
};

/**
 * Turns the form into the API body. Removes the separators people type (dots in the document, spaces in the phone)
 * and checks only what can be fixed before sending; the API validates the rest and its messages are shown as they
 * come.
 */
export function toWalkerDraft(form: WalkerForm): { draft: WalkerDraft } | { errors: WalkerFormErrors } {
  const errors: WalkerFormErrors = {};
  const fullName = form.fullName.trim();
  const documentNumber = form.documentNumber.replace(/[\s.\-]/g, '').toUpperCase();
  const phone = form.phone.replace(/[\s\-]/g, '');

  if (fullName === '') {
    errors.fullName = 'Escribe tu nombre completo.';
  }
  if (documentNumber === '') {
    errors.documentNumber = 'Escribe tu número de documento.';
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    errors.phone = 'Escribe tu celular de 10 dígitos.';
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const draft: WalkerDraft = { fullName, documentType: form.documentType, documentNumber, phone };
  if (form.experience.trim() !== '') draft.experience = form.experience.trim();
  return { draft };
}
