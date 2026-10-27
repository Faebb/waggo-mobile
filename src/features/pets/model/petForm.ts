import { parseDateText } from '@/shared/ui/DateField';

import type { PetDraft, PetSize } from './types';

/** What the owner typed in the "Agregar perro" form, as raw text. */
export type PetForm = {
  name: string;
  breed: string;
  size: PetSize;
  /** Day/month/year as typed, "10/05/2021". */
  birthDate: string;
  weightKg: string;
  medicalNotes: string;
};

export type PetFormErrors = Partial<Record<'name' | 'birthDate' | 'weightKg', string>>;

export const EMPTY_PET_FORM: PetForm = {
  name: '',
  breed: '',
  size: 'Medium',
  birthDate: '',
  weightKg: '',
  medicalNotes: '',
};

/** Today as "YYYY-MM-DD" in the device time zone, to compare with a `DateOnly`. */
function todayIso(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Turns the form into the API body. Only checks what the owner can fix before sending (missing name, a date that
 * does not exist or is in the future, weight that is not a number); the API validates the business rules and its
 * messages are shown as they come.
 */
export function toPetDraft(form: PetForm, now: Date = new Date()): { draft: PetDraft } | { errors: PetFormErrors } {
  const errors: PetFormErrors = {};
  const name = form.name.trim();
  const weightText = form.weightKg.trim().replace(',', '.');
  const weightKg = weightText === '' ? undefined : Number(weightText);
  const birthDate = form.birthDate.trim() === '' ? undefined : parseDateText(form.birthDate);

  if (name === '') {
    errors.name = 'Escribe el nombre de tu perro.';
  }
  if (birthDate === null) {
    errors.birthDate = 'Escribe una fecha real, por ejemplo 10/05/2021.';
  } else if (birthDate !== undefined && birthDate > todayIso(now)) {
    errors.birthDate = 'La fecha de nacimiento no puede ser futura.';
  }
  if (weightKg !== undefined && !Number.isFinite(weightKg)) {
    errors.weightKg = 'Escribe el peso en kilos, por ejemplo 12,5.';
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const draft: PetDraft = { name, size: form.size };
  if (form.breed.trim() !== '') draft.breed = form.breed.trim();
  if (birthDate !== undefined && birthDate !== null) draft.birthDate = birthDate;
  if (weightKg !== undefined) draft.weightKg = weightKg;
  if (form.medicalNotes.trim() !== '') draft.medicalNotes = form.medicalNotes.trim();
  return { draft };
}
