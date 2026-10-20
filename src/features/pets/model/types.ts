/** Mirrors the backend enum `PetSize` (waggo-api › Waggo.Domain.Enums.Pets). */
export const PET_SIZES = ['Small', 'Medium', 'Large'] as const;
export type PetSize = (typeof PET_SIZES)[number];

export const PET_SIZE_LABELS: Record<PetSize, string> = {
  Small: 'Pequeño',
  Medium: 'Mediano',
  Large: 'Grande',
};

/** A dog as the API returns it (`PetResponse`). */
export type Pet = {
  id: string;
  name: string;
  breed: string | null;
  size: PetSize;
  birthDate: string | null;
  weightKg: number | null;
  medicalNotes: string | null;
};

/** Body of `POST /api/v1/pets`: optional fields are left out when empty. */
export type PetDraft = {
  name: string;
  size: PetSize;
  breed?: string;
  weightKg?: number;
  medicalNotes?: string;
};
