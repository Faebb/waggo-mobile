/** Mirrors the backend enum `PetSize` (waggo-api › Waggo.Domain.Enums.Pets). */
export const PET_SIZES = ['Small', 'Medium', 'Large'] as const;
export type PetSize = (typeof PET_SIZES)[number];

export const PET_SIZE_LABELS: Record<PetSize, string> = {
  Small: 'Pequeño',
  Medium: 'Mediano',
  Large: 'Grande',
};

/** Chip labels with the weight range of each size (RF-004, ⚠️ provisional ranges; design proposal 07 · 9). */
export const PET_SIZE_CHIP_LABELS: Record<PetSize, string> = {
  Small: 'Pequeño · <10 kg',
  Medium: 'Mediano · 10–25 kg',
  Large: 'Grande · >25 kg',
};

/** ⚠️ provisional (RF-004 business rules): mirrors `Pet.MaxPetsPerOwner` in waggo-api, shown as "2 de 10 perros". */
export const MAX_PETS_PER_OWNER = 10;

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
  /** `DateOnly`, "2021-05-10". */
  birthDate?: string;
  weightKg?: number;
  medicalNotes?: string;
};
