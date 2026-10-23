import { PET_SIZE_LABELS, type Pet } from './types';

/** One-line summary of a dog: "Mediano · Criolla · 14,5 kg". Missing data is left out. */
export function describePet(pet: Pick<Pet, 'size' | 'breed' | 'weightKg'>): string {
  const weight = pet.weightKg === null ? null : `${String(pet.weightKg).replace('.', ',')} kg`;
  return [PET_SIZE_LABELS[pet.size], pet.breed, weight].filter((part) => part !== null).join(' · ');
}

/** Age of a dog as "5 años", "4 meses" or "Menos de 1 mes"; null when the birth date is unknown. */
export function describeAge(birthDate: string | null, today: Date = new Date()): string | null {
  if (birthDate === null) return null;
  const [year, month, day] = birthDate.split('-').map(Number) as [number, number, number];
  let months = (today.getFullYear() - year) * 12 + (today.getMonth() + 1 - month);
  if (today.getDate() < day) months -= 1;
  if (months < 1) return 'Menos de 1 mes';
  if (months < 12) return months === 1 ? '1 mes' : `${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 año' : `${years} años`;
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "2021-05-10" → "10 de mayo de 2021". */
export function formatBirthDate(birthDate: string): string {
  const [year, month, day] = birthDate.split('-').map(Number) as [number, number, number];
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}
