/** The two sides of a walk (`WalkParty` in waggo-api). */
export const WALK_PARTIES = ['Owner', 'Walker'] as const;
export type WalkParty = (typeof WALK_PARTIES)[number];

/** A chat message (`WalkMessageResponse`, RF-013). */
export type WalkMessage = { id: string; sentBy: WalkParty; text: string; sentAt: string };

export const PARTY_NAMES: Record<WalkParty, string> = { Owner: 'Dueño', Walker: 'Paseador' };
