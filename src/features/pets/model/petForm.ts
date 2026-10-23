import type { PetDraft, PetSize } from './types';

/** What the owner typed in the "Agregar perro" form, as raw text. */
export type PetForm = {
  name: string;
  breed: string;
  size: PetSize;
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

/** Oldest birth date the form accepts (RF-004 spec: a dog older than this is a typo). */
const MAX_AGE_YEARS = 30;

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function isRealDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split('-').map(Number) as [number, number, number];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function birthDateError(text: string, today: Date): string | undefined {
  if (!isRealDate(text)) return 'Escribe la fecha como AAAA-MM-DD, por ejemplo 2021-05-10.';
  if (text > isoDate(today)) return 'La fecha de nacimiento no puede ser futura.';
  const oldest = new Date(today.getFullYear() - MAX_AGE_YEARS, today.getMonth(), today.getDate());
  if (text < isoDate(oldest)) return `La fecha de nacimiento no puede ser de hace más de ${MAX_AGE_YEARS} años.`;
  return undefined;
}

/**
 * Turns the form into the API body. Only checks what the owner can fix before sending (missing name, weight that
 * is not a number); the API validates the business rules and its messages are shown as they come.
 */
export function toPetDraft(form: PetForm, today: Date = new Date()): { draft: PetDraft } | { errors: PetFormErrors } {
  const errors: PetFormErrors = {};
  const name = form.name.trim();
  const weightText = form.weightKg.trim().replace(',', '.');
  const birthDate = form.birthDate.trim();
  const weightKg = weightText === '' ? undefined : Number(weightText);

  if (name === '') {
    errors.name = 'Escribe el nombre de tu perro.';
  }
  if (birthDate !== '') {
    const birthDateProblem = birthDateError(birthDate, today);
    if (birthDateProblem) errors.birthDate = birthDateProblem;
  }
  if (weightKg !== undefined && !Number.isFinite(weightKg)) {
    errors.weightKg = 'Escribe el peso en kilos, por ejemplo 12,5.';
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const draft: PetDraft = { name, size: form.size };
  if (form.breed.trim() !== '') draft.breed = form.breed.trim();
  if (birthDate !== '') draft.birthDate = birthDate;
  if (weightKg !== undefined) draft.weightKg = weightKg;
  if (form.medicalNotes.trim() !== '') draft.medicalNotes = form.medicalNotes.trim();
  return { draft };
}
