import { PET_SIZE_LABELS, type Pet } from './types';

/** One-line summary of a dog: "Mediano · Criolla · 14,5 kg". Missing data is left out. */
export function describePet(pet: Pick<Pet, 'size' | 'breed' | 'weightKg'>): string {
  const weight = pet.weightKg === null ? null : `${String(pet.weightKg).replace('.', ',')} kg`;
  return [PET_SIZE_LABELS[pet.size], pet.breed, weight].filter((part) => part !== null).join(' · ');
}
