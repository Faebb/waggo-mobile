/** GET/PUT /api/v1/users/me. No `bio` field — not part of this slice. */
export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
};

export type ProfileUpdate = { fullName: string | null; phone: string | null };
