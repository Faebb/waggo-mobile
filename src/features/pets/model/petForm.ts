import type { PetDraft, PetSize } from './types';

/** What the owner typed in the "Agregar perro" form, as raw text. */
export type PetForm = {
  name: string;
  breed: string;
  size: PetSize;
  weightKg: string;
  medicalNotes: string;
};

export type PetFormErrors = Partial<Record<'name' | 'weightKg', string>>;

export const EMPTY_PET_FORM: PetForm = { name: '', breed: '', size: 'Medium', weightKg: '', medicalNotes: '' };

/**
 * Turns the form into the API body. Only checks what the owner can fix before sending (missing name, weight that
 * is not a number); the API validates the business rules and its messages are shown as they come.
 */
export function toPetDraft(form: PetForm): { draft: PetDraft } | { errors: PetFormErrors } {
  const errors: PetFormErrors = {};
  const name = form.name.trim();
  const weightText = form.weightKg.trim().replace(',', '.');
  const weightKg = weightText === '' ? undefined : Number(weightText);

  if (name === '') {
    errors.name = 'Escribe el nombre de tu perro.';
  }
  if (weightKg !== undefined && !Number.isFinite(weightKg)) {
    errors.weightKg = 'Escribe el peso en kilos, por ejemplo 12,5.';
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const draft: PetDraft = { name, size: form.size };
  if (form.breed.trim() !== '') draft.breed = form.breed.trim();
  if (weightKg !== undefined) draft.weightKg = weightKg;
  if (form.medicalNotes.trim() !== '') draft.medicalNotes = form.medicalNotes.trim();
  return { draft };
}
